#!/bin/sh
# Refresh the publication list from Google Scholar and publish it.
#
#   sh tools/refresh_and_publish.sh            refresh, and push to master if the list changed
#   DRY_RUN=1 sh tools/refresh_and_publish.sh  refresh and check that pushing would work, but publish nothing
#
# It works in its own copy of the repository, under ~/Library/Application Support/luyangluo-site/, so it never
# touches the folder you edit in and does not care which branch that folder is on. Google Scholar refuses
# GitHub's servers, so this runs from a Mac: by hand, or on a schedule set up by tools/install_schedule.sh.
# If Scholar refuses the request the script stops, nothing is published, and a notification says so.
set -eu

main() {
  repo_url="https://github.com/LLYXC/LLYXC.github.io.git"
  base="$HOME/Library/Application Support/luyangluo-site"
  clone="$base/repo"
  echo "=== $(date '+%Y-%m-%d %H:%M:%S') ==="
  mkdir -p "$base"
  [ -d "$clone/.git" ] || git clone --quiet --depth 1 --branch master "$repo_url" "$clone"
  cd "$clone"
  # this copy only ever mirrors master: start from exactly what is published
  git fetch --quiet --depth 1 origin master
  git checkout --quiet -B master FETCH_HEAD

  python3 tools/update_papers.py

  if git diff --quiet -- _data; then
    echo "The list is unchanged; nothing to publish."
    [ "${DRY_RUN:-}" = 1 ] && git push --dry-run --quiet origin master && echo "Dry run: pushing would work."
    return 0
  fi
  git add _data
  git commit --quiet -m "Update publications from Google Scholar"
  if [ "${DRY_RUN:-}" = 1 ]; then
    git push --dry-run --quiet origin master && echo "Dry run: the list changed and pushing would work. Nothing was published."
    git reset --quiet --hard FETCH_HEAD
  else
    git push --quiet origin master
    echo "Published. The site rebuilds in about a minute."
  fi
}

# Tell the person at the Mac if a scheduled run fails; otherwise the only trace is the log.
notify_failure() {
  code=$?
  if [ "$code" -ne 0 ]; then
    echo "FAILED with exit code $code"
    osascript -e 'display notification "The publication list was not updated. See ~/Library/Logs/luyangluo-site-papers.log" with title "luyangluo.com"' >/dev/null 2>&1 || true
  fi
}
trap notify_failure EXIT

main "$@"
