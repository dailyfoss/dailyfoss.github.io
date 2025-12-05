# Parallel Processing Explained

## How It Works

The tool uses a **concurrent queue** pattern to process multiple repositories simultaneously while respecting the parallelism limit.

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    File Queue (1166 files)                   │
│  [file1, file2, file3, file4, ..., file1166]                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Parallel Workers (PARALLEL_LIMIT=10)            │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Worker 1 │ Worker 2 │ Worker 3 │ Worker 4 │ ... Worker 10   │
│          │          │          │          │                 │
│ file1    │ file2    │ file3    │ file4    │ ... file10      │
│   ↓      │   ↓      │   ↓      │   ↓      │     ↓           │
│ GitHub   │ GitHub   │ GitHub   │ GitHub   │   GitHub        │
│ API      │ API      │ API      │ API      │   API           │
│   ↓      │   ↓      │   ↓      │   ↓      │     ↓           │
│ Detect   │ Detect   │ Detect   │ Detect   │   Detect        │
│   ↓      │   ↓      │   ↓      │   ↓      │     ↓           │
│ Update   │ Update   │ Update   │ Update   │   Update        │
│   ↓      │   ↓      │   ↓      │   ↓      │     ↓           │
│ file11   │ file12   │ file13   │ file14   │ ... file20      │
│   ↓      │   ↓      │   ↓      │   ↓      │     ↓           │
│  ...     │  ...     │  ...     │  ...     │    ...          │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Results Collection                        │
│  [result1, result2, result3, ..., result1166]               │
└─────────────────────────────────────────────────────────────┘
```

## Sequential vs Parallel

### Sequential Processing (Old Way)
```
Time: ────────────────────────────────────────────────────────>
      [file1] [file2] [file3] [file4] [file5] ... [file1166]
      
Total Time: 1166 files × 1 second = ~20 minutes
```

### Parallel Processing (New Way - 10 workers)
```
Time: ────────────────────────────────────────────────────────>
      [file1 ]
      [file2 ]
      [file3 ]
      [file4 ]
      [file5 ]
      [file6 ]
      [file7 ]
      [file8 ]
      [file9 ]
      [file10] → [file11] → [file12] → ... → [file1166]
      
Total Time: 1166 files ÷ 10 workers × 1 second = ~2 minutes
```

### Parallel Processing (Fast Mode - 50 workers)
```
Time: ────────────────────────────────────────────────────────>
      [file1 ]
      [file2 ]
      [file3 ]
      ...
      [file50] → [file51] → [file52] → ... → [file1166]
      
Total Time: 1166 files ÷ 50 workers × 1 second = ~25 seconds
```

## Code Implementation

The parallel processing is implemented using a queue-based approach:

```javascript
const PARALLEL_LIMIT = 10; // Configurable

async function processFilesInParallel(files, limit) {
    const results = [];
    const queue = [...files];
    const inProgress = new Set();

    return new Promise((resolve) => {
        const processNext = () => {
            // Check if done
            if (queue.length === 0 && inProgress.size === 0) {
                resolve(results);
                return;
            }

            // Start new tasks up to the limit
            while (queue.length > 0 && inProgress.size < limit) {
                const filePath = queue.shift();
                const promise = processFile(filePath);
                
                inProgress.add(promise);
                
                promise.then((result) => {
                    results.push(result);
                    inProgress.delete(promise);
                    processNext(); // Process next file
                });
            }
        };

        processNext();
    });
}
```

## Performance Comparison

| Workers | Time (1166 files) | Speedup | GitHub API Calls/sec |
|---------|-------------------|---------|---------------------|
| 1       | ~20 minutes       | 1x      | 1 req/sec           |
| 3       | ~6 minutes        | 3x      | 3 req/sec           |
| 10      | ~2 minutes        | 10x     | 10 req/sec          |
| 20      | ~1 minute         | 20x     | 20 req/sec          |
| 50      | ~25 seconds       | 48x     | 50 req/sec          |

## Rate Limit Considerations

### Without GitHub Token (60 requests/hour)
```
60 requests/hour = 1 request/minute

Safe configurations:
- PARALLEL_LIMIT=1: Will take ~20 minutes, uses 1166 requests
- PARALLEL_LIMIT=3: Will hit rate limit after ~20 files
- PARALLEL_LIMIT=10: Will hit rate limit after ~6 files

❌ Not recommended without token
```

### With GitHub Token (5000 requests/hour)
```
5000 requests/hour = 83 requests/minute = 1.4 requests/second

Safe configurations:
- PARALLEL_LIMIT=10: ~2 minutes, uses 1166 requests ✅
- PARALLEL_LIMIT=20: ~1 minute, uses 1166 requests ✅
- PARALLEL_LIMIT=50: ~25 seconds, uses 1166 requests ✅

✅ All configurations safe with token
```

## Optimization Tips

1. **Use GitHub Token**: Essential for parallel processing
   ```bash
   export GITHUB_TOKEN=your_token
   ```

2. **Adjust Parallelism**: Based on your needs
   ```bash
   # Conservative (safe without token)
   PARALLEL_LIMIT=3 npm run update-platforms
   
   # Balanced (default)
   PARALLEL_LIMIT=10 npm run update-platforms
   
   # Maximum speed (requires token)
   PARALLEL_LIMIT=50 npm run update-platforms:fast
   ```

3. **Monitor Progress**: Real-time progress shows percentage
   ```
   [450/1166 38%] ✅ immich.json: linux, windows, macos, android
   ```

4. **Check Stats First**: See what needs updating
   ```bash
   npm run check-platform-stats
   ```

## Why Parallel Processing?

### Benefits
- ✅ **50x faster** than sequential processing
- ✅ **Real-time progress** tracking
- ✅ **Efficient API usage** - maximizes throughput
- ✅ **Configurable** - adjust based on rate limits
- ✅ **Resilient** - errors don't stop other workers

### Trade-offs
- ⚠️ Requires GitHub token for best performance
- ⚠️ Higher memory usage (minimal impact)
- ⚠️ More complex error handling

## Conclusion

Parallel processing transforms a 20-minute task into a 25-second task, making it practical to run frequently and keep platform information up-to-date across all 1166+ repositories.
