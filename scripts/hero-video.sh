#!/bin/sh
# Turn a recording into the Home hero clip that the site dithers live.
#   scripts/hero-video.sh <input video> [start seconds] [length seconds] [crop] [width] [filters]
# crop is an ffmpeg crop expression (default: the whole frame), e.g. "iw:ih*0.72:0:ih*0.28"
# to drop the top 28%; width is the output width in pixels (default 640); filters are
# extra ffmpeg filters run first on the full frame, e.g. "hflip" to mirror it or
# "delogo=x=480:y=500:w=100:h=980" to smooth a distracting line out of the background.
# Output: public/video/hero-coding.mp4 — silent, greyscale, 12 fps (the figures are drawn
# at 12 fps), H.264 so every browser plays it. Contrast is raised a little so light
# backgrounds drop out to the page colour.
# Keep the recordings themselves in footage/ (git-ignored), never in public/.
set -e
[ -n "$1" ] || { echo "usage: $0 <input video> [start seconds] [length seconds] [crop] [width] [filters]" >&2; exit 1; }
out="$(dirname "$0")/../public/video/hero-coding.mp4"
mkdir -p "$(dirname "$out")"
ffmpeg -loglevel error -y -ss "${2:-0}" -t "${3:-8}" -i "$1" -an \
  -vf "fps=12,${6:-null},crop=${4:-iw:ih:0:0},scale=${5:-640}:-2,format=gray,eq=contrast=1.25:brightness=0.04,format=yuv420p" \
  -c:v libx264 -crf 24 -preset slow -movflags +faststart "$out"
ls -lh "$out"
