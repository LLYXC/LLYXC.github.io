#!/bin/sh
# Schedule the publication refresh on this Mac: 10:00 on the 1st and the 15th of each month.
#
#   sh tools/install_schedule.sh            install, or reinstall after editing either script
#   sh tools/install_schedule.sh --remove   stop and remove the schedule
#
# If the Mac is asleep at that time, the run happens when it wakes. If it is switched off, that run is skipped.
# Output goes to ~/Library/Logs/luyangluo-site-papers.log. To change the days or the hour, edit the
# StartCalendarInterval block below and run this script again.
set -eu

label="com.luyangluo.site-papers"
plist="$HOME/Library/LaunchAgents/$label.plist"
base="$HOME/Library/Application Support/luyangluo-site"
log="$HOME/Library/Logs/luyangluo-site-papers.log"
here="$(cd "$(dirname "$0")" && pwd)"

launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
if [ "${1:-}" = "--remove" ]; then
  rm -f "$plist" "$base/refresh_and_publish.sh"
  echo "Schedule removed. The repository copy in \"$base/repo\" and the log were left in place."
  exit 0
fi

# The schedule runs its own copy of the script, so editing or switching branches in the working folder cannot break it.
mkdir -p "$base" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
cp "$here/refresh_and_publish.sh" "$base/refresh_and_publish.sh"

cat > "$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key>
  <array><string>/bin/sh</string><string>$base/refresh_and_publish.sh</string></array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Day</key><integer>1</integer><key>Hour</key><integer>10</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Day</key><integer>15</integer><key>Hour</key><integer>10</integer><key>Minute</key><integer>0</integer></dict>
  </array>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>
  <key>StandardOutPath</key><string>$log</string>
  <key>StandardErrorPath</key><string>$log</string>
</dict>
</plist>
PLIST
launchctl bootstrap "gui/$(id -u)" "$plist"
echo "Scheduled: 10:00 on the 1st and 15th of each month. Log: $log"
