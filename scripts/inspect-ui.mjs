// Uses the installed agent-browser CLI, never the user's personal browser profile.
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
const cli=process.env.AGENT_BROWSER_BIN||join(process.env.APPDATA,'npm/node_modules/agent-browser/bin/agent-browser.js');
const run=(...args)=>execFileSync(process.execPath,[cli,'--session','liars-ui',...args],{encoding:'utf8',timeout:30000});
mkdirSync('docs/screenshots',{recursive:true});
const targets=process.argv.length===4?[[Number(process.argv[2]),Number(process.argv[3])]]:[[667,375],[844,390],[932,430],[1366,768]];
for(const [w,h] of targets){
  console.log(run('set','viewport',String(w),String(h)).trim());
  console.log(run('open',pathToFileURL(resolve('dist/Liars-Deck.html')).href).trim());
  console.log(run('snapshot','-i').trim());
  console.log(run('screenshot',`docs/screenshots/agent-table-${w}x${h}.png`).trim());
  console.log(run('find','first','.seat:not(:disabled)','click').trim());
  run('wait','--fn','document.getElementById("execution").dataset.phase === "ready"');
  console.log(run('snapshot','-i').trim());
  console.log(run('screenshot',`docs/screenshots/agent-execution-${w}x${h}.png`).trim());
  const geometry=`JSON.stringify({viewport:[innerWidth,innerHeight],document:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],fire:document.getElementById('fire-button').getBoundingClientRect().toJSON(),gun:document.getElementById('gun').getBoundingClientRect().toJSON()})`;
  console.log(run('eval','-b',Buffer.from(geometry).toString('base64')).trim());
  run('click','#cancel-execution');
  run('wait','--fn','document.getElementById("execution").hidden');
}
