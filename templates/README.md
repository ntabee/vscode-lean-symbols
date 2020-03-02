# List of symbol translation tables for [Lean for VS Code](https://github.com/leanprover/vscode-lean)

Generated from <%= rawUrl %>

```bash
git clone <%= repo %>
cd <%= repoDir %>
./generate
```

<!--- %%TOC%% --->

<% const ents = Object.entries(blockwise).sort((b1, b2) => b1[0] < b2[0] ? -1 : 1)
   ents.forEach(([b, syms]) => {
%>
## <%= b %>

<%- syms.map((s) => '- ' + renderBind(s)).join('\n') %> 
<% }) %>