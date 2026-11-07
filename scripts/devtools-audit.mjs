import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const out='docs/final-qa';await mkdir(out,{recursive:true});
const transport=new StdioClientTransport({command:process.execPath,args:[
  resolve('node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js'),
  '--headless','--isolated','--viewport=844x390','--no-usage-statistics','--no-performance-crux',`--workspace=${process.cwd()}`,
]});
const client=new Client({name:'liars-deck-qa',version:'1.0.0'});
try {
  await client.connect(transport);
  const {tools}=await client.listTools();
  if(process.argv.includes('--schemas')){console.log(JSON.stringify(tools.filter(t=>/evaluate|console|network|screenshot|navigate|new_page/.test(t.name)),null,2));}
  else {
    const evidence={tools:tools.map(t=>t.name),calls:[]};
    let pageId;
    const call=async(name,args)=>{if(pageId!==undefined)args={pageId,...args};const result=await client.callTool({name,arguments:args});if(result.isError)throw new Error(JSON.stringify(result));evidence.calls.push({name,args,result});return result;};
    const opened=await call('new_page',{url:'http://127.0.0.1:4173/'});
    pageId=Number(opened.content.find(c=>c.type==='text').text.match(/(\d+):[^\n]*\[selected\]/)[1]);
    await call('evaluate_script',{function:'() => ({title:document.title,inputs:document.querySelectorAll("input[data-draft]").length,overflow:document.documentElement.scrollWidth-innerWidth,buttons:[...document.querySelectorAll("button")].filter(b=>b.getBoundingClientRect().width).length})'});
    await call('take_screenshot',{filePath:resolve(out,'devtools-setup.png')});
    await call('evaluate_script',{function:'async () => {document.querySelector("#setup-form").requestSubmit();await new Promise(r=>setTimeout(r,450));return [...document.querySelectorAll(".seat")].map(b=>({visible:b.innerText,ariaLabel:b.getAttribute("aria-label"),description:b.getAttribute("aria-description"),clickHandler:typeof b.onclick}));}'});
    await call('list_console_messages',{});
    await call('list_network_requests',{});
    await call('take_screenshot',{filePath:resolve(out,'devtools-table.png')});
    await writeFile(`${out}/devtools-mcp.json`,JSON.stringify(evidence,null,2));
    console.log('Chrome DevTools MCP: '+evidence.calls.map(c=>c.name).join(', '));
  }
} finally {await client.close();}
