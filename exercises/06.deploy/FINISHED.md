# ✅ Section 6 done

One `createServer`, two entries: `http.ts` for Node, `worker.ts` for Workers.

## Talk it over

- What would break if this server kept state between requests in memory, and two Worker instances answered the same user?
- What's the smallest change that makes the deployed copy safe for real data?
- Which hosts can reach `localhost`, and which need a public URL?

**Next:** put it in a real host. See [DEPLOY.md, section 3](../../DEPLOY.md#3-add-it-to-a-host).
