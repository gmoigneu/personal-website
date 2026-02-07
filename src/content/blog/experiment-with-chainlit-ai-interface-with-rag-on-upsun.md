---
title: Experiment with Chainlit AI interface with RAG on Upsun
description: Learn to deploy production-ready RAG applications with Chainlit and Python on Upsun. Tutorial covers OpenAI Assistants integration, llama_index implementation, and secure authentication.
pubDate: 2025-01-21
---


## What is Chainlit?

Chainlit is an open-source async Python framework which allows developers to build scalable Conversational AI or agentic applications. While providing the base framework, Chainlit gives you full flexibility to implement any external API, logic or local models you want to run.

![Test assistant](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/assistant-test.png)


In this tutorial we will be implementing RAG (Retrieval Augmented Generation) in two ways:

- The first will leverage **OpenAI assistants** with uploaded documents
- The second will be using `llama_index` with a **local folder** of documents


## Setting up Chainlit locally



### Virtualenv

Let's start by creating our `virtualenv`:

```bash
mkdir chainlit && cd chainlit
python3 -m venv venv
source venv/bin/activate
```

### Install dependencies

We are now adding our dependencies and freeze them:

```bash
pip install chainlit
pip install llama_index # Useful only for case #2
pip install openai
pip freeze > requirements.txt
```

### Test Chainlit

Let's start chainlit:

```bash
chainlit hello
```

You should now see a placeholder on [http://localhost:8000/](http://localhost:8000/)

![Chainlit demo](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/demo.png)



## Let's deploy it on Upsun



### Init the git repository

```bash
git init .
```

Don't forget to add a `.gitignore` file. Some folders will be used later on.

```txt
.env
database/**
data/**
storage/**
.chainlit
venv
__pycache__
```

### Create an Upsun project

```bash
upsun project:create # follow the prompts
```

The Upsun CLI will automatically set the `upsun` remote on your local git repository.

### Let's add the configuration

Here is an example configuration to run Chainlit:

```yaml
applications:
  chainlit:
    source:
      root: "/"

    type: "python:3.11"

    mounts:
      "/database":
        source: "storage"
        source_path: "database"
      ".files":
        source: "storage"
        source_path: "files"
      "__pycache__":
        source: "storage"
        source_path: "pycache"
      ".chainlit":
        source: "storage"
        source_path: ".chainlit"

    web:
      commands:
        start: "chainlit run app.py --port $PORT --host 0.0.0.0"
      upstream:
        socket_family: tcp
      locations:
        "/":
          passthru: true
        "/public":
          passthru: true

    build:
      flavor: none

    hooks:
      build: |
        set -eux
        pip install -r requirements.txt
      deploy: |
        set -eux
      # post_deploy: |

routes:
  "https://{default}/":
    type: upstream
    upstream: "chainlit:http"
  "https://www.{default}":
    type: redirect
    to: "https://{default}/"
```

Nothing out of the ordinary there! We install all dependencies in the `build` hook and then start the app with `chainlit` directly and we specify the port it should run on.

💡 You will need to add your `OPENAI_API_KEY` to either the configuration or your environment variables on the Upsun console or through the CLI. You can get the key by generating it on the [OpenAI Platform site](https://platform.openai.com).

To add it as an environment variable through the CLI, you can use:

```bash
upsun variable:create env:OPENAI_API_KEY --value=sk-proj[...]
```

### Let's deploy!

Commit the files and configuration to deploy!

```bash
git add .
git commit -m "First chainlit example"
upsun push
```

### Review the deployment

If everything goes well, you should have Chainlit deployed and working correctly on your `main` environment:

![First push](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/first-push.png)



## First implementation: OpenAI Assistant & uploaded files

The goal here is to make Chainlit work with an OpenAI assistant. Our content will be loaded directly in the assistant on OpenAI.



### Create the assistant

Go to the [Platform Assistants](https://platform.openai.com/assistants) page and create a new one.

![Assistant](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/assistant.png)

Set the system instructions and select the model you want to use. Make sure the `Response Format` is set to `text`. I like to keep the temperature low, around `0.10` to avoid hallucinations.

Copy your assistant ID `asst_[xxx]` and add it to your environment variables:

```bash
upsun variable:create env:OPENAI_ASSISTANT_ID --value=asst_[...]
```

### Upload your content

Enable the `File search` toggle and click `+ Files`. Upload your content. While OpenAI is capable of ingesting a lot of different file formats, I like to upload only Markdown as it is faster and easier to parse, removing potential issues with PDF for example.

![Upload](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/upload-files.png)

After a few seconds, the content is ingested and transformed into a vector store, ready to be used:

![Vector store](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/file-search.png)

💡 You can reuse an existing vector store on a different assistant if you want!

Everything is now ready on the OpenAI side and we can implement the logic in Chainlit.

### Adding the assistant logic.

Open `app.py` and replace the content with the code below:

```python
import os
from io import BytesIO
from pathlib import Path
from typing import List
from typing import Optional

from openai import AsyncAssistantEventHandler, AsyncOpenAI, OpenAI

from literalai.helper import utc_now

import chainlit as cl
from chainlit.config import config
from chainlit.element import Element

async_openai_client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
sync_openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

assistant = sync_openai_client.beta.assistants.retrieve(
    os.environ.get("OPENAI_ASSISTANT_ID")
)

config.ui.name = assistant.name

class EventHandler(AsyncAssistantEventHandler):

    def __init__(self, assistant_name: str) -> None:
        super().__init__()
        self.current_message: cl.Message = None
        self.current_step: cl.Step = None
        self.current_tool_call = None
        self.assistant_name = assistant_name

    async def on_text_created(self, text) -> None:
        self.current_message = await cl.Message(author=self.assistant_name, content="").send()

    async def on_text_delta(self, delta, snapshot):
        await self.current_message.stream_token(delta.value)

    async def on_text_done(self, text):
        await self.current_message.update()

    async def on_tool_call_created(self, tool_call):
        self.current_tool_call = tool_call.id
        self.current_step = cl.Step(name=tool_call.type, type="tool")
        self.current_step.language = "python"
        self.current_step.created_at = utc_now()
        await self.current_step.send()

    async def on_tool_call_delta(self, delta, snapshot):
        if snapshot.id != self.current_tool_call:
            self.current_tool_call = snapshot.id
            self.current_step = cl.Step(name=delta.type, type="tool")
            self.current_step.language = "python"
            self.current_step.start = utc_now()
            await self.current_step.send()

        if delta.type == "code_interpreter":
            if delta.code_interpreter.outputs:
                for output in delta.code_interpreter.outputs:
                    if output.type == "logs":
                        error_step = cl.Step(
                            name=delta.type,
                            type="tool"
                        )
                        error_step.is_error = True
                        error_step.output = output.logs
                        error_step.language = "markdown"
                        error_step.start = self.current_step.start
                        error_step.end = utc_now()
                        await error_step.send()
            else:
                if delta.code_interpreter.input:
                    await self.current_step.stream_token(delta.code_interpreter.input)


    async def on_tool_call_done(self, tool_call):
        self.current_step.end = utc_now()
        await self.current_step.update()

    async def on_image_file_done(self, image_file):
        image_id = image_file.file_id
        response = await async_openai_client.files.with_raw_response.content(image_id)
        image_element = cl.Image(
            name=image_id,
            content=response.content,
            display="inline",
            size="large"
        )
        if not self.current_message.elements:
            self.current_message.elements = []
        self.current_message.elements.append(image_element)
        await self.current_message.update()


async def upload_files(files: List[Element]):
    file_ids = []
    for file in files:
        uploaded_file = await async_openai_client.files.create(
            file=Path(file.path), purpose="assistants"
        )
        file_ids.append(uploaded_file.id)
    return file_ids


async def process_files(files: List[Element]):
    # Upload files if any and get file_ids
    file_ids = []
    if len(files) > 0:
        file_ids = await upload_files(files)

    return [
        {
            "file_id": file_id,
            "tools": [{"type": "code_interpreter"}, {"type": "file_search"}],
        }
        for file_id in file_ids
    ]


@cl.on_chat_start
async def start_chat():
    # Create a Thread
    thread = await async_openai_client.beta.threads.create()
    # Store thread ID in user session for later use
    cl.user_session.set("thread_id", thread.id)
    # await cl.Avatar(name=assistant.name, path="./public/logo.png").send()
    await cl.Message(content=f"Hello, I'm {assistant.name}!").send()


@cl.on_message
async def main(message: cl.Message):
    thread_id = cl.user_session.get("thread_id")

    attachments = await process_files(message.elements)

    # Add a Message to the Thread
    oai_message = await async_openai_client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=message.content,
        attachments=attachments,
    )

    # Create and Stream a Run
    async with async_openai_client.beta.threads.runs.stream(
        thread_id=thread_id,
        assistant_id=assistant.id,
        event_handler=EventHandler(assistant_name=assistant.name),
    ) as stream:
        await stream.until_done()
```

Feel free to review the whole code but let's focus on the important parts:

```python
@cl.on_chat_start
async def start_chat():
    # Create a Thread
    thread = await async_openai_client.beta.threads.create()
    # Store thread ID in user session for later use
    cl.user_session.set("thread_id", thread.id)
    # await cl.Avatar(name=assistant.name, path="./public/logo.png").send()
    await cl.Message(content=f"Hello, I'm {assistant.name}!").send()
```

`on_chat_start` is called when a new chat is created. It creates a new thread on OpenAI to handle the conversation and start it with a new welcome message.

```python
@cl.on_message
async def main(message: cl.Message):
    thread_id = cl.user_session.get("thread_id")

    attachments = await process_files(message.elements)

    # Add a Message to the Thread
    oai_message = await async_openai_client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=message.content,
        attachments=attachments,
    )

    # Create and Stream a Run
    async with async_openai_client.beta.threads.runs.stream(
        thread_id=thread_id,
        assistant_id=assistant.id,
        event_handler=EventHandler(assistant_name=assistant.name),
    ) as stream:
        await stream.until_done()
```

`on_message` is triggered whenever the user is submitting a new message. It sends the content to the OpenAI API on the thread and then launches a stream. You can find more information on how they work on [the official documentation](https://platform.openai.com/docs/api-reference/threads).

To summarize, instead of getting the answer as part of the HTTP response of the Message request, we have to poll the Threads API to find new messages that would have been created. It's a bit more cumbersone but allows OpenAI to perform multiple operations asynchronously and add the results into the thread.

### Commit the changes and deploy

Let's state and commit the changes:

```bash
git add .upsun/config.yaml
git add app.py
git commit -m "OpenAI assistant version"
```

And we can now deploy:

```bash
upsun push
```

### Test the Assistant

Go to the deployed Chainlit instance and ask any question related to the content you uploaded:

![Test assistant](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/assistant-test.png)

You should get an appropriate answer! It might be a bit slow due to the polling process especially on the first message. But it works! OpenAI gives you the indications where in your documents it sourced some of the information



## Second implementation: OpenAI + llama_index

So the goal for this version will be to build the knowledge locally and then rely on OpenAI to output the final form.



### Create a new branch

Let's kickstart this by working on a new environment/branch:

```bash
git checkout -b llama-index
```

### Add two new folders and mounts to store our data

Create the folders first on your machine:

```bash
mkdir data
mkdir storage
```
And now add the mount to our Upsun configuration:

```yaml
    mounts:
      "/data":
        source: "storage"
        source_path: "data"
      "/storage":
        source: "storage"
        source_path: "storage"
```

`data` will be used for our source documents and `storage` will handle the cached `VectorStore`.

### Let's update our app

We will not be using the OpenAI assistant there so the code will be a lot simpler:

```python
import os
import openai
import chainlit as cl

from llama_index.core import (
    Settings,
    StorageContext,
    VectorStoreIndex,
    SimpleDirectoryReader,
    load_index_from_storage,
)
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.query_engine.retriever_query_engine import RetrieverQueryEngine
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.service_context import ServiceContext
from llama_index.core.callbacks import CallbackManager

openai.api_key = os.environ.get("OPENAI_API_KEY")

try:
    # rebuild storage context
    storage_context = StorageContext.from_defaults(persist_dir="./storage")
    # load index
    index = load_index_from_storage(storage_context)
except:
    documents = SimpleDirectoryReader("./data").load_data(show_progress=True)
    index = VectorStoreIndex.from_documents(documents)
    index.storage_context.persist()


@cl.on_chat_start
async def start():
    Settings.llm = OpenAI(
        model="gpt-4o", temperature=0.1, max_tokens=2048, streaming=True
    )
    Settings.context_window = 2048

    Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
    Settings.node_parser = SentenceSplitter(chunk_size=256, chunk_overlap=20)
    Settings.num_output = 1024

    query_engine = index.as_query_engine(streaming=True, similarity_top_k=2)
    cl.user_session.set("query_engine", query_engine)

    await cl.Message(
        author="Assistant", content="Hello! Im an AI assistant. How may I help you?"
    ).send()


@cl.on_message
async def main(message: cl.Message):
    query_engine = cl.user_session.get("query_engine") # type: RetrieverQueryEngine

    msg = cl.Message(content="", author="Assistant")

    res = await cl.make_async(query_engine.query)(message.content)

    for token in res.response_gen:
        await msg.stream_token(token)
    await msg.send()

```

Let's break down the important parts.

When the application is starting, we use the `text-embedding-3-small` (line 39) to embed our documents into our `VectorStore`.

```bash
$ chainlit run app.py -w --port 8000
2025-01-07 17:06:59 - Loaded .env file
Loading files: 100%|██████████████████████████████████████████████████████████████████████████| 3/3 [00:00<00:00, 17.52file/s]
```

And whenever the user creates a new chat, we define a `query_engine` (lines 43-44). It will be passed alongside every message and will contain the result from the k-search of our vector store. You can note that we are using a `similarity_top_k` param to define how many documents should be matched when searching.

⚠️ I carefully set the `Settings.num_output` (line 41) so llama does not give me a bigger context window than what OpenAI can take. You can get a lot of context in the query and longer answers by increasing these values but this will obviously consume more tokens and generate higher bills so be mindful!

### Deploy the new environment

As usual, commit and push!

```bash
git add .
git commit -m "Switch to llama_index"
upsun push
```
Upsun CLI will confirm you want to create a new environment:

```bash
$ upsun push
Selected project: Chainlit Devcenter tutorial (545vnfflc3n4u)

Enter the target branch name (default: llama-index):

Create llama-index as an active environment? [Y/n]

Pushing HEAD to the branch llama-index of project Chainlit Devcenter tutorial (545vnfflc3n4u)
It will be created as an active environment.
```

Hit `Yes` and the new app will be deployed in a new isolated environment.

### Push some data

In order to have some documents to work with on the Upsun environment, you can automatically upload your `data` folder:

```bash
$ upsun mount:upload
Enter a number to choose a mount to upload to:
  [0] data: storage
  [1] database: storage
  [2] .files: storage
  [3] __pycache__: storage
  [4] .chainlit: storage
 > 0

Source directory [data]:

Uploading files from data to the remote mount data
Are you sure you want to continue? [Y/n]

  building file list ...   done
  ./
  developer_themes.md
  intro.md

  sent 27.83K bytes  received 92 bytes  11.17K bytes/sec
  total size is 90.92K  speedup is 3.26
```
### Test llama_index

Once deployed, head over to your environment (`llama-index-sukwicq-[project id].[region].platformsh.site`) and test a prompt:

![llama test](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/llama-test.png)

As contrary to the OpenAI `file_search`, the response does not give you the source of the data as it was passed directly from `llama_index` to OpenAI.

💡 While most of our system relies on local data, we are still generating the final answer through OpenAI. If you wanted to run everything locally, you could rely on Chainlit being capable of querying model like [SmolLM](https://huggingface.co/blog/smollm) running locally.

## Bonus: Adding authentification to Chainlit

Now that our Chainlit application is deployed and available, it would be great to add some form of authentication to make sure only you and your folks can access it. While Chainlit has many capabilities for this, we will go for the simpler route of using a `sqlite` database for this.



### Create the database folder

```bash
mkdir database
```

And add the mount in the Upsun configuration:

```yaml
    mounts:
      "/database":
        source: "storage"
        source_path: "database"
```

### Add the auth logic to our application

First let's add a new environment variable:

```bash
upsun variable:create env:DB_PATH --value="database/auth.db"
```

We can now add the logic into `app.py`:

```python
import sqlite3
[...]

db_path = os.environ.get("DB_PATH")

# Create the database if it doesn't exist
con = sqlite3.connect(db_path)
cur = con.cursor()
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )
""")
con.commit()
con.close()

@cl.password_auth_callback
def auth_callback(username: str, password: str):
    if not os.path.exists(db_path):
        with open(db_path, 'w') as file:
            file.write('')

    con = sqlite3.connect(db_path)
    cur = con.cursor()
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    cur.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, hashed_password))
    user = cur.fetchone()
    if user:
        return cl.User(
            identifier=user[1], metadata={"role": "admin", "provider": "credentials"}
        )
    else:
        return None
```

When the script is run, it first check that it can open the database or create it if it doesn't exist.

Adding `@cl.password_auth_callback` will automagically add a login form to our app. The logic in `auth_callback` is pretty simple right there. Feel free to change it the way you want.

We are hashing the form password and looking up for a user that matches both `username` and `password`. If so we return the user with the `admin` privileges.

### Create a simple script to generate hashed passwords

```python
import hashlib
import random
import string

def generate_password(length=12):
    # Define character sets for password generation
    chars = string.ascii_letters + string.digits + string.punctuation
    # Generate random password
    password = ''.join(random.choice(chars) for _ in range(length))
    # Hash the password
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    return password, hashed_password

def main():
    # Generate password and get its hash
    password, hashed_password = generate_password()

    # Display both the password and its hash
    print(f"Generated Password: {password}")
    print(f"Hashed Password: {hashed_password}")

if __name__ == "__main__":
    main()
```

You can invoke it and it will output the password and the hash:

```bash
$ python create_password.py
Generated Password: F\7r\pQ-jmP$
Hashed Password: 67f4db1ae09453ff6ce68e5d3c138259f80b5b3b6c595226435323d0004d99f7
```

### Adding users

Now it's just a matter of creating new records in the `users` table of our `auth.db`. Don't forget you need to put the **hashed** version of the password in the database! You can either run queries through the CLI or use GUI:

![Creating users](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/creating-users.png)

And we should now be ready to go!

### Deploy the authentication

As usual, commit and push:

```bash
git add .
git commit -m "Add auth"
upsun push
```

In order for our authentication to work, let's upload our `sqlite` database:

```bash
upsun mount:upload
```

### Login now!

You now need to input your credentials to login to your Chainlit interface:

![Login form](https://devcenter.upsun.com/images/deploying-chainlit-with-rag/login-form.png)



## Conclusion

In this tutorial, we've successfully deployed a Chainlit application on Upsun with two different RAG implementations, each offering unique advantages. The OpenAI Assistant approach provides built-in file handling and clear source attribution, while the llama_index implementation offers more control over the embedding process and local vector store management. We've also added a layer of security through SQLite-based authentication, making the application production-ready.

By leveraging Upsun's platform capabilities, particularly its storage mounts and environment management, we've created a scalable and secure conversational AI interface that can be adapted for various use cases. Whether you're building a document-aware chatbot, a knowledge base assistant, or any other RAG-powered application, this setup provides a solid foundation for further development.

Remember that while we used OpenAI's models for generation in both implementations, the architecture we've built could be adapted to work with other language models, including local ones, depending on your specific needs and requirements.
