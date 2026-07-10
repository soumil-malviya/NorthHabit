#!/bin/bash

QUEUE_FILE="prompt_queue.txt"
COMPLETED_FILE="prompt_history.txt"
LOG_FILE="claude_live_log.txt"

touch "$QUEUE_FILE"
touch "$COMPLETED_FILE"

echo "🚀 Claude Queue Watcher started in Supervised Live Mode!"
echo "📍 Base URL: http://localhost:8082"
echo "--------------------------------------------------------"

while true; do
  # Read the top prompt line
  PROMPT=$(head -n 1 "$QUEUE_FILE")

  if [ -z "$PROMPT" ]; then
    echo "😴 Queue is empty. Waiting for prompts in $QUEUE_FILE... (Ctrl+C to exit)"
    sleep 10
    continue
  fi

  echo "🤖 Sending Prompt to Claude Code:"
  echo "👉 \"$PROMPT\""
  echo "--------------------------------------------------------"

  # Run Claude live using tee to capture text errors without breaking the interface
  ANTHROPIC_AUTH_TOKEN="freecc" ANTHROPIC_BASE_URL="http://localhost:8082" claude -p "$PROMPT" --dangerously-skip-permissions 2>&1 | tee "$LOG_FILE"
  CLAUDE_EXIT_CODE=$?

  # Strict validation: Check both the exit code AND the captured log file text for errors
  if [ $CLAUDE_EXIT_CODE -ne 0 ] || grep -qE "API request failed|timed out|Timeout|504|NVIDIA NIM|Bad Gateway" "$LOG_FILE"; then
    echo "--------------------------------------------------------"
    echo "⏳ Server Timeout or API Failure detected!"
    echo "🛌 Cooling down for 4 minutes to let the NVIDIA NIM server recover..."
    
    # 4-Minute Visual Timer
    for i in {5..1}; do
      printf "\r🔄 Retrying in %d seconds... " "$i"
      sleep 1
    done
    echo ""
    echo "--------------------------------------------------------"
  else
    # True success path
    echo "--------------------------------------------------------"
    echo "✅ Task completed and verified successfully!"
    
    # Send system notification
    osascript -e "display notification \"Task completed successfully!\" with title \"Claude Agent\" sound name \"Glass\""
    
    # Log to history
    echo "$(date): $PROMPT" >> "$COMPLETED_FILE"
    
    # Pop it out of the queue file safely since it actually finished
    tail -n +2 "$QUEUE_FILE" > temp_queue.txt && mv temp_queue.txt "$QUEUE_FILE"
    
    echo "⏭️ Moving to the next task in 5 seconds..."
    echo "--------------------------------------------------------"
    sleep 5
  fi

  # Clean up the temporary validation log
  rm -f "$LOG_FILE"
done
