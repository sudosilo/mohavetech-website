VZ.load(P=>{
const {h32,poly,line,box,ring,label,INK,MOTION}=VZ;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const BT={tanker:{label:'Skyscraper, one of the biggest',w:22,h:150},battle:{label:'Glass tower, big and fast',w:16,h:105},cargo:{label:'Office block, big and steady',w:30,h:52},tug:{label:'House, small and nimble',w:14,h:14},speed:{label:'Slim tower, small and quick',w:10,h:72},sail:{label:'Shop, light and easy',w:18,h:20}};
const K=6;let W,H,DPR,S,T;const BG='#f7f9fa',LAND='#f6f0e2';
const terraceY=(k,x)=>H*(0.36+k*0.105)+Math.sin(x/W*6.28*1.1+k*1.7)*H*0.022;
const rows=[...Array(K)].map(()=>[]);
P.forEach(p=>rows[Math.floor(h32(p.name,80)*K)].push(p));
rows.forEach(r=>r.sort((a,b)=>h32(a.name,81)-h32(b.name,81)));
document.getElementById('count').textContent=P.filter(p=>!p.old).length+' buildings, '+P.filter(p=>p.old).length+' under construction';
const cars=[];for(let k=0;k<K;k++)for(let i=0;i<4;i++)cars.push({k,x:h32('c'+k+i,1),v:(h32('cv'+k+i,2)>0.5?1:-1)*(0.04+h32('cw'+k+i,3)*0.05),c:['#1e9e3e','#c49a00','#e07800','#d93636',INK][Math.floor(h32('cc'+k+i,4)*5)]});
const clouds=[0,1,2,3].map(i=>({x:h32('cl'+i,1),y:0.08+h32('cy'+i,2)*0.16,s:0.7+h32('cs'+i,3)*0.6}));
function layout(){
  let maxW=0;rows.forEach(r=>{let s=0;r.forEach(p=>s+=BT[p.kind].w*p.sizeF+3);maxW=Math.max(maxW,s);});
  S=Math.min(1.6,(W*0.97)/maxW);
  rows.forEach((r,k)=>{let s=0;r.forEach(p=>s+=BT[p.kind].w*p.sizeF*S+3*S);let x=(W-s)/2+1.5*S;
    r.forEach(p=>{const bt=BT[p.kind],w=bt.w*p.sizeF*S,h=bt.h*p.sizeF*S*(0.85+h32(p.name,82)*0.3);p.bx=x;p.bw=w;p.bh=h;p.by=terraceY(k,x+w/2);p.seed=h32(p.name,83);x+=w+3*S;});});
}
function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;T=Math.max(0.85,Math.min(1.3,Math.min(W,H)/360));layout();}
function bldg(c,p,t){
  const x=p.bx,w=p.bw,h=p.bh,y=p.by,col=p.color,k=p.kind;c.lineWidth=1.1;c.lineJoin='round';
  const fillPoly=(pts)=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const q of pts)c.lineTo(q[0],q[1]);c.closePath();c.fillStyle=BG;c.fill();c.strokeStyle=col;c.stroke();};
  if(p.old){c.setLineDash([3,3]);fillPoly([[x,y],[x,y-h*0.6],[x+w,y-h*0.6],[x+w,y]]);c.setLineDash([]);
    for(let yy=y;yy>y-h*0.6;yy-=6*S)line(c,x,yy,x+w,yy,col);line(c,x,y,x+w,y-h*0.6,col);line(c,x+w,y,x,y-h*0.6,col);
    const mx=x+w*0.7,top=y-h*0.6-Math.max(16*S,h*0.35);line(c,mx,y-h*0.6,mx,top,col);const a=Math.sin(t*0.3+p.seed*6)*0.3;line(c,mx-w*0.4,top,mx+Math.cos(a)*w*1.2,top+Math.sin(a)*4,col);line(c,mx+Math.cos(a)*w*0.9,top+Math.sin(a)*3,mx+Math.cos(a)*w*0.9,top+8*S,col);return;}
  if(k==='tanker'){fillPoly([[x,y],[x,y-h*0.6],[x+w*0.12,y-h*0.6],[x+w*0.12,y-h*0.85],[x+w*0.26,y-h*0.85],[x+w*0.26,y-h],[x+w*0.74,y-h],[x+w*0.74,y-h*0.85],[x+w*0.88,y-h*0.85],[x+w*0.88,y-h*0.6],[x+w,y-h*0.6],[x+w,y]]);
    line(c,x+w/2,y-h,x+w/2,y-h-14*S,col);if(Math.sin(t*3+p.seed*9)>0.6)ring(c,x+w/2,y-h-14*S,1.8*S,'#d93636');
    for(let yy=y-6*S;yy>y-h*0.58;yy-=6*S)line(c,x+2*S,yy,x+w-2*S,yy,col);}
  else if(k==='battle'){fillPoly([[x,y],[x,y-h*0.88],[x+w,y-h],[x+w,y]]);for(let i=1;i<4;i++)line(c,x+i*w/4,y,x+i*w/4,y-h*0.88-i*h*0.03,col);}
  else if(k==='cargo'){fillPoly([[x,y],[x,y-h],[x+w,y-h],[x+w,y]]);for(let yy=y-6*S;yy>y-h+2*S;yy-=7*S)for(let xx=x+3*S;xx<x+w-3*S;xx+=6*S){const lit=Math.sin(t*0.4+xx*7+yy*3+p.seed*20)>0.85;box(c,xx,yy-3*S,xx+3*S,yy,lit?'#c49a00':col);}}
  else if(k==='tug'){fillPoly([[x,y],[x,y-h],[x-2*S,y-h],[x+w/2,y-h-w*0.55],[x+w+2*S,y-h],[x+w,y-h],[x+w,y]]);box(c,x+w*0.38,y-h*0.6,x+w*0.62,y,col);}
  else if(k==='speed'){fillPoly([[x,y],[x,y-h],[x+w,y-h],[x+w,y]]);c.beginPath();c.arc(x+w/2,y-h,w/2,Math.PI,0);c.fillStyle=BG;c.fill();c.strokeStyle=col;c.stroke();for(let yy=y-8*S;yy>y-h;yy-=8*S)line(c,x+w/2,yy,x+w/2,yy-3*S,col);}
  else{fillPoly([[x,y],[x,y-h],[x+w,y-h],[x+w,y]]);c.strokeStyle=col;c.beginPath();for(let i=0;i<4;i++)c.arc(x+w/8+i*w/4,y-h*0.62,w/8,0,Math.PI);c.stroke();line(c,x,y-h*0.62,x+w,y-h*0.62,col);box(c,x+w*0.15,y-h*0.9,x+w*0.85,y-h*0.72,col);}
}
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000)*MOTION,t=now/1000;last=now;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(224,120,0,.6)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(W*0.84,H*0.16,13*T,0,6.283);ctx.stroke();
  for(const cl of clouds){cl.x=(cl.x+dt*0.006)%1.2;const x=cl.x*W*1.2-W*0.1,y=cl.y*H,s=cl.s*T;ctx.strokeStyle='rgba(18,58,74,.3)';ctx.beginPath();ctx.arc(x,y,8*s,Math.PI,0);ctx.arc(x+12*s,y-4*s,10*s,Math.PI,0);ctx.arc(x+24*s,y,7*s,Math.PI,0);ctx.lineTo(x-8*s,y);ctx.stroke();}
  for(let k=0;k<K;k++){
    ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W;x+=4)ctx.lineTo(x,terraceY(k,x));ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=LAND;ctx.fill();
    ctx.strokeStyle='#8a7550';ctx.lineWidth=1.3;ctx.beginPath();for(let x=0;x<=W;x+=4){const y=terraceY(k,x);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
    ctx.strokeStyle='rgba(18,58,74,.25)';ctx.lineWidth=1;ctx.setLineDash([4,5]);ctx.beginPath();for(let x=0;x<=W;x+=4){const y=terraceY(k,x)+5*T;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.setLineDash([]);
    for(const p of rows[k])bldg(ctx,p,t);
    for(const c of cars){if(c.k!==k)continue;c.x=(c.x+c.v*dt+1)%1;const x=c.x*W,y=terraceY(k,x)+(c.v>0?3:7)*T;ctx.lineWidth=1;box(ctx,x-3*T,y-1.5*T,x+3*T,y+1.5*T,c.c);}
    if(k===2){const tx=((t*24*T)%(W+160))-80;for(let i=0;i<6;i++){const x=tx-i*12*T;const y=terraceY(k,x)+5*T;box(ctx,x-5*T,y-3*T,x+5*T,y+2*T,i===0?INK:'rgba(18,58,74,.55)');}label(ctx,'GitHub line',W*0.98,terraceY(k,W*0.98)+18*T,'right',9.5*T);}
  }
  const s=VZ.sel;if(s&&s.ref){const p=s.ref;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(p.bx-4,p.by-(p.old?p.bh*0.6:p.bh)-4,p.bw+8,(p.old?p.bh*0.6:p.bh)+8);ctx.setLineDash([]);}
  requestAnimationFrame(frame);
}
cv.addEventListener('pointerdown',e=>{const X=e.clientX,Y=e.clientY;let best=null;
  for(let k=K-1;k>=0&&!best;k--)for(const p of rows[k]){const h=p.old?p.bh*0.6:p.bh;if(X>=p.bx-2&&X<=p.bx+p.bw+2&&Y<=p.by+2&&Y>=p.by-h-4){best=p;break;}}
  if(best)VZ.open({ref:best,title:best.name,kind:(best.old?'Under construction, 90 days or more':BT[best.kind].label)+VZ.sizeText(best),age:VZ.ageText(best),host:best.host});else VZ.close();});
addEventListener('resize',resize);resize();requestAnimationFrame(frame);
});
