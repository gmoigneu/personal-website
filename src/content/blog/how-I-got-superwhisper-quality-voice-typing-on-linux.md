---
title: "How I got SuperWhisper-quality voice typing on my Linux desktop"
description: "Get near‑SuperWhisper voice typing on Linux with hyprvoice + whisper.cpp: offline, fast, Wayland‑friendly, and accurate enough to replace your keyboard."
pubDate: 2026-02-20
---

I've been a [SuperWhisper](https://superwhisper.com/) advocate for nearly a year. Press a hotkey, talk, and watch your words appear. Accurately punctuated, properly formatted, entirely offline. On my Mac, it's become muscle memory. On my Linux desktop, I had nothing.

That's not for lack of trying. Voice typing on Linux has historically meant clunky Electron wrappers, X11 hacks that crumble the moment you're on Wayland, or shipping your audio to someone else's cloud. None of those options survived contact with a daily driver setup. So I kept typing at 40 words per minute while my brain ran at 150.

Then I found [`hyprvoice`](https://github.com/LeonardoTrapani/hyprvoice).

## The case for talking to your computer

The numbers tell the story. The average person types at roughly 40 WPM on a keyboard. Fast typists hit 80, maybe 100. Conversational speech sits around 130-150 WPM without even trying. That's a 3x gap between how fast you can think out loud and how fast your fingers can keep up.

Speed isn't even the main thing, though. When I type, I edit as I go: backspacing, restructuring, second-guessing phrasing mid-sentence. When I speak, the words come out differently. More fluid, closer to how the idea actually formed in my head. First drafts come faster, and they tend to need less reworking. That's been my experience with SuperWhisper on macOS, and I wanted the same thing on every machine I use.

The problem is that SuperWhisper is Mac-only. No Linux port, no plans for one that I know of. And the few Linux alternatives I tried were either cloud-dependent (my voice data going to OpenAI's servers for every sentence? no thanks) or built for X11 and broken on modern Wayland compositors.

## What hyprvoice actually is

[`hyprvoice`](https://github.com/LeonardoTrapani/hyprvoice) is a voice-to-text daemon for Wayland desktops, written in Go by Leonardo Trapani. Despite the name suggesting a tight coupling with Hyprland, it works on any Wayland compositor. I run it on [niri](https://github.com/niri-wm/niri), a scrollable-tiling compositor that deserves its own blog post.

Under the hood, a control daemon manages the lifecycle over Unix sockets. When you trigger it, an audio pipeline kicks in: PipeWire captures your microphone, the audio gets sent to a transcription backend, and the result is injected into whatever text field has focus via `wtype` or `ydotool`. It runs as a systemd user service. Start it once and forget about it.

The backend flexibility is the real selling point. You can point it at cloud providers (OpenAI, Groq, Deepgram, Mistral, ElevenLabs) if latency and convenience matter more than privacy. Or you can run everything locally with `whisper.cpp`, which is what I do. My voice never leaves my machine.

## Building hyprvoice from source on Ubuntu

hyprvoice ships AUR packages for Arch-based systems, but I'm on Ubuntu. Building from source is straightforward if you have Go installed.

Clone the repo and build:

```bash
git clone https://github.com/LeonardoTrapani/hyprvoice.git
cd hyprvoice
go mod download
go build ./cmd/hyprvoice
sudo mv hyprvoice /usr/bin/
```

Then set up the systemd user service so the daemon starts automatically and stays running in the background:

```bash
mkdir -p ~/.config/systemd/user
cp hyprvoice.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now hyprvoice.service
```

That's it for the daemon. It'll start on login from now on and listen for toggle commands over its Unix socket.

## Setting up whisper.cpp with GPU acceleration

This is the part that takes the most effort, but it's also what makes the whole setup worth it. [whisper.cpp](https://github.com/ggml-org/whisper.cpp) is a C/C++ port of OpenAI's Whisper model, and with CUDA support enabled, it's fast enough to feel like magic.

Clone and build whisper.cpp with NVIDIA GPU support:

```bash
git clone https://github.com/ggml-org/whisper.cpp.git
cd whisper.cpp

sudo apt install cmake

# Build with CUDA support for NVIDIA GPUs
cmake -B build -DGGML_CUDA=1
cmake --build build -j --config Release
```

No NVIDIA GPU? Drop the `-DGGML_CUDA=1` flag and it'll build for CPU only. Still usable, but noticeably slower on longer recordings.

You'll also need `ydotool`, which hyprvoice uses to inject the transcribed text into your active window:

```bash
sudo apt install ydotoold
```

Make sure the `ydotoold` daemon is running (it likely auto-starts after install, but check with `systemctl status ydotoold`).

Now move the whisper CLI binary somewhere on your PATH:

```bash
sudo mv build/bin/whisper-cli /usr/bin/
```

## Configuration

With both binaries in place, run the onboarding wizard:

```bash
hyprvoice onboarding
```

This walks you through selecting your transcription backend and model. For a local GPU setup, pick `whisper.cpp` and the `large-v3-turbo` model. This is OpenAI's speed-optimized variant. It cuts the decoder from 32 layers down to 4, which makes it dramatically faster than the full `large-v3` while staying within 1-2% of its accuracy. If you have a GPU, there's no reason to pick anything else.

After onboarding, restart the service to pick up the new config:

```bash
systemctl --user restart hyprvoice.service
```

### Binding a hotkey

The last piece is a keyboard shortcut to toggle recording. This depends on your compositor. I use [niri](https://github.com/niri-wm/niri), so my keybinding lives in `~/.config/niri/config.kdl`:

```kdl
binds {
    Mod+A { spawn "hyprvoice" "toggle"; }
}
```

For Hyprland, you'd add something like this to your `hyprland.conf`:

```ini
bind = SUPER, A, exec, hyprvoice toggle
```

For Sway, in your sway config:

```ini
bindsym Mod4+a exec hyprvoice toggle
```

Pick whatever key feels natural. I went with `Mod+A` because it's right under my left hand and doesn't conflict with anything else in my setup.

## How it actually performs

Sub-100ms transcription latency. Even after a full minute of continuous speech. I had to double-check this because it felt wrong. I'd stop talking and the text would appear almost instantly. But that's what `large-v3-turbo` on a GPU gets you. The heavy lifting happens in the encoder, and the stripped-down 4-layer decoder tears through the output.

Accuracy is solid. Technical vocabulary, proper nouns, mixed English: it handles all of it without the garbled output I've gotten from lesser models. It punctuates correctly most of the time, which matters more than you'd think when you're dictating into a chat window or a code comment.

It's not perfect. My one gripe: occasionally the transcription includes a literal Enter keystroke, which in a chat application sends my half-finished message. Annoying when you're dictating a prompt to an LLM and it fires off mid-sentence. I suspect this is a `ydotool` injection issue rather than a whisper.cpp problem, and it's infrequent enough that I haven't dug into it yet.

## Is it as good as SuperWhisper?

Honest answer: not quite. SuperWhisper has a more polished UX: visual feedback during recording, a slick mode system for different writing contexts, and the kind of fit-and-finish you get from a dedicated commercial product. hyprvoice is a daemon you toggle from the command line. No GUI, no frills.

But the transcription quality is comparable. Speed might actually be better thanks to my desktop GPU being beefier than my MacBook's neural engine. And the privacy story is identical: everything stays local.

For a free, open-source tool that's been around for less than a year, hyprvoice fills a gap that's been open on the Linux desktop for way too long. I'm typing this paragraph. The rest of the article, I dictated.
