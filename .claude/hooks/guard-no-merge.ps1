# garden-skills PreToolUse guard
# Intercepts dangerous Bash commands; exit 2 to reject (blocking).
# Input: JSON payload on stdin with tool_input.command
# Reference: https://docs.claude.com/en/docs/claude-code/hooks
#
# Strategy: parse the command into separate sub-commands (split on ;, &&, ||, |)
# then check each sub-command's leading tokens. Quoted strings and here-docs are
# stripped first so keywords inside commit messages don't trigger false positives.

$ErrorActionPreference = 'Stop'

try {
    $raw = [Console]::In.ReadToEnd()
    if (-not $raw) { exit 0 }
    $payload = $raw | ConvertFrom-Json
    $cmd = $payload.tool_input.command
    if (-not $cmd) { exit 0 }
} catch {
    exit 0
}

function Deny($reason) {
    [Console]::Error.WriteLine("REFUSED: $reason")
    exit 2
}

# Step 1: strip here-doc bodies BEFORE collapsing whitespace.
# Matches: <<'EOF' ... EOF   |   <<EOF ... EOF   |   <<-EOF ... EOF
$stripped = [regex]::Replace(
    $cmd,
    "(?ms)<<-?\s*[`"']?(\w+)[`"']?\s*\r?\n.*?^\s*\1\s*(\r?\n|$)",
    "<<HEREDOC>>`n"
)

# Step 2: collapse whitespace
$normalized = ($stripped -replace '\s+', ' ').Trim()

# Step 3: strip quoted strings (so keywords inside -m "..." don't trigger)
# Note: simplistic; nested quotes and escaped quotes are not handled — acceptable.
$scan = $normalized
$scan = $scan -replace "'[^']*'", "''"
$scan = $scan -replace '"[^"]*"', '""'

# Step 4: split into sub-commands on common separators (preserves intent boundary)
# Don't split inside quoted regions (already stripped above)
$subCommands = $scan -split '\s*(?:&&|\|\||;|\|)\s*'

foreach ($sub in $subCommands) {
    $sub = $sub.Trim()
    if (-not $sub) { continue }

    # Rule 1: git push to main / master only when the destination ref is exactly
    # main/master, e.g. `git push origin main` or `git push origin HEAD:main`.
    if ($sub -match '^\s*git\s+push\b.*(?:^|\s)(?:\S+:)?(main|master)\s*$') {
        Deny "pushing to main/master is forbidden by team policy (use team/T-* branches)"
    }

    # Rule 2: git push --force / --force-with-lease
    if ($sub -match '^\s*git\s+push\b.*--force') {
        Deny "--force / --force-with-lease push is forbidden"
    }

    # Rule 3: git merge / git rebase (exclude merge-base which is read-only)
    if ($sub -match '^\s*git\s+(merge|rebase)\b' -and $sub -notmatch '^\s*git\s+merge-base\b') {
        Deny "git merge/rebase is forbidden (team never merges; humans only)"
    }

    # Rule 4: gh pr merge
    if ($sub -match '^\s*gh\s+pr\s+merge\b') {
        Deny "gh pr merge is forbidden (team only opens drafts; humans merge)"
    }

    # Rule 5: gh pr create WITHOUT --draft
    if ($sub -match '^\s*gh\s+pr\s+create\b' -and $sub -notmatch '--draft') {
        Deny "gh pr create must include --draft flag"
    }
}

exit 0
