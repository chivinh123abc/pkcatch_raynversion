import fs from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import postcss from 'postcss';
const dir='scratch/live-update-2026-11-16';
const bytes=fs.readFileSync(dir+'/app.c0081498f2.js');
if(!createHash('sha256').update(bytes).digest('hex').startsWith('c0081498f2'))throw Error('Native gift source changed');
const source=ts.createSourceFile('native.js',bytes.toString(),99,true),printer=ts.createPrinter();
const bodies={};
function visit(node){
 if(ts.isBinaryExpression(node)&&['a.LinkFx','a.ItemFX'].includes(node.left.getText(source)))bodies[node.left.getText(source).slice(2)]=printer.printNode(ts.EmitHint.Expression,node.right,source);
 ts.forEachChild(node,visit);
}visit(source);
for(const [name,body] of Object.entries(bodies))fs.writeFileSync(`src/utils/gift${name}Engine.ts`,`// @ts-nocheck\n// Isolated native visual routine; build b05c8cc201. Regenerate: node scripts/extract-gift-effects.mjs\nexport function create${name}({a,e,Ut,nn,Ys}) { return (${body}); }\n`);
const helpers=JSON.parse(fs.readFileSync('docs/strict-parity-evidence/native-data.json'));
fs.writeFileSync('src/utils/giftSpriteGlow.ts',`// @ts-nocheck\n// Native UI.spriteGlow, build b05c8cc201.\nexport const giftSpriteGlow = ${helpers.spriteGlow};\n`);
fs.copyFileSync('docs/strict-parity-evidence/translations.json','src/data/giftTranslations.json');
const css=postcss.parse(fs.readFileSync(dir+'/app.3e06fa8ed6.css')),out=postcss.root(),animations=new Set();
css.walkRules(rule=>{
 if(rule.parent.type==='atrule'&&rule.parent.name.includes('keyframes'))return;
 const selectors=rule.selectors.filter(s=>/\.(?:lk-|rc-|berry-|item-choice|ic-|gift-|gb-|hatch-fx|hx-|fx-skip|hm-fx|btn\b)/.test(s)&&!s.includes('data-theme=light')&&!s.includes(':root')&&!s.startsWith('body.calm'));
 if(!selectors.length)return;
 const clone=rule.clone({selector:selectors.map(s=>{
  s=s.replace(/^html\.px\s+|^\.px\s+/, '');
  return /^(?:\.rc-fx|\.lk-fx|\.berry-fx|\.hatch-fx|\.item-choice|\.item-drops)\b/.test(s)||s==='.gift'||s.startsWith('.gift ')||s.startsWith('.gift.')?'.native-gift'+s:'.native-gift '+s;
 }).join(',')});
 clone.walkDecls(d=>{d.value=d.value.replaceAll('../assets/','/assets/').replaceAll('url(assets/','url(/assets/');if(d.prop.startsWith('animation'))d.value.split(/[ ,]+/).forEach(v=>animations.add(v));});
 let wrapped=clone;for(let p=rule.parent;p.type!=='root';p=p.parent)if(p.type==='atrule'&&['media','supports','container'].includes(p.name))wrapped=postcss.atRule({name:p.name,params:p.params,nodes:[wrapped]});out.append(wrapped);
});
css.walkAtRules(/keyframes$/,rule=>{if(animations.has(rule.params))out.append(rule.clone());});
const renamed=new Map();out.walkAtRules(/keyframes$/,rule=>{const name=rule.params;renamed.set(name,'gift-native-'+name);rule.params='gift-native-'+name;});
out.walkDecls(/^animation/,decl=>{decl.value=decl.value.replace(/[a-zA-Z][\w-]*/g,name=>renamed.get(name)||name);});
fs.writeFileSync('src/styles/gift-reference.css','/* Generated from native v0.5.02 by scripts/extract-gift-effects.mjs. */\n'+out.toString());
console.log({engines:Object.fromEntries(Object.entries(bodies).map(([k,v])=>[k,v.length])),rules:out.nodes.length});
