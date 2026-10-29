VZ.load(P=>{
const {h32,poly,line,box,ring,label,INK,MOTION}=VZ;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const SP={tanker:{label:'Walrus, one of the biggest',L:44,v:4,zone:'ice'},battle:{label:'Orca, big and fast',L:48,v:30,zone:'sea'},cargo:{label:'Polar bear, big and steady',L:38,v:9,zone:'ice'},tug:{label:'Penguin, small and nimble',L:15,v:10,zone:'ice'},speed:{label:'Sea lion, small and quick',L:26,v:36,zone:'sea'},sail:{label:'Puffin, light and easy',L:12,v:26,zone:'sky'}};
const live=P.filter(p=>!p.old),frozen=P.filter(p=>p.old);
document.getElementById('count').textContent=live.length+' out on the ice, '+frozen.length+' frozen in the iceberg';
let W,H,DPR,S,T,WL,bg,floes=[];const SKY='#f7f9fa',SEA='#eef7f9';
const cr=live.map(p=>({p,x:h32(p.name,100),y:h32(p.name,101),dir:h32(p.name,102)>0.5?1:-1,ph:h32(p.name,103)*6,wob:h32(p.name,104)*6,floe:0,v:SP[p.kind].v*(0.85+p.speed*0.3)}));
const snow=[...Array(40)].map((_,i)=>({x:h32('sx'+i,1),y:h32('sy'+i,2),v:0.02+h32('sv'+i,3)*0.03}));
function build(){
  bg=document.createElement('canvas');bg.width=W*DPR;bg.height=H*DPR;const g=bg.getContext('2d');g.scale(DPR,DPR);
  g.fillStyle=SKY;g.fillRect(0,0,W,WL);const gr=g.createLinearGradient(0,WL,0,H);gr.addColorStop(0,SEA);gr.addColorStop(1,'#dcebf0');g.fillStyle=gr;g.fillRect(0,WL,W,H-WL);
  g.strokeStyle='rgba(18,58,74,.3)';g.lineWidth=1.2;g.beginPath();g.moveTo(0,WL-30*T);g.lineTo(W*0.18,WL-70*T);g.lineTo(W*0.3,WL-40*T);g.lineTo(W*0.45,WL-82*T);g.lineTo(W*0.62,WL-36*T);g.lineTo(W*0.8,WL-60*T);g.lineTo(W,WL-28*T);g.stroke();
  g.strokeStyle='rgba(224,120,0,.6)';g.beginPath();g.arc(W*0.82,WL-90*T,12*T,Math.PI,0);g.stroke();
  const ix=W*0.62,iy=WL+H*0.12,iw=W*0.36,ih=H*0.3;g.strokeStyle='rgba(18,58,74,.45)';g.beginPath();g.moveTo(ix,iy);g.lineTo(ix+iw*0.15,iy-ih*0.1);g.lineTo(ix+iw*0.5,iy-ih*0.05);g.lineTo(ix+iw*0.9,iy-ih*0.12);g.lineTo(ix+iw,iy+ih*0.3);g.lineTo(ix+iw*0.85,iy+ih*0.8);g.lineTo(ix+iw*0.4,iy+ih);g.lineTo(ix+iw*0.05,iy+ih*0.6);g.closePath();g.stroke();
  bg.ice={x:ix,y:iy,w:iw,h:ih};
}
function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;WL=H*0.42;T=Math.max(0.85,Math.min(1.3,Math.min(W,H)/360));S=Math.max(0.8,Math.min(1.5,Math.sqrt(W*H/(live.length*2400))));
  floes=[[0.02,0.3],[0.34,0.6],[0.64,0.98]].map(([a,b],i)=>({x0:a*W,x1:b*W,y:WL-(6+i*3)*T}));
  const ice=cr.filter(c=>SP[c.p.kind].zone==='ice');ice.forEach((c,i)=>{c.floe=i%floes.length;});
  build();const ic=bg.ice;frozen.forEach((p,i)=>{const n=frozen.length,cols=4;p._x=ic.x+ic.w*(0.15+(i%cols)*0.22);p._y=ic.y+ic.h*(0.15+Math.floor(i/cols)*0.2);p._L=14*T;});}
function quad4(c,L,col,ph){const bl=L*0.55,bh=L*0.24,ll=L*0.2,by=-(ll+bh/2);
  for(const [hx,o] of [[bl*0.32,0],[-bl*0.32,Math.PI]])for(const f of [0,1]){c.globalAlpha=f?0.45:1;const a=Math.sin(ph+o+f*Math.PI)*0.4;line(c,hx,by+bh*0.3,hx+Math.sin(a)*ll*1.2,0,col);}c.globalAlpha=1;
  c.strokeStyle=col;c.beginPath();c.ellipse(0,by,bl/2,bh/2,0,0,6.283);c.stroke();
  const hx=bl*0.55,hy=by-bh*0.1+Math.sin(ph*2)*1;c.beginPath();c.ellipse(hx,hy,L*0.1,L*0.07,0.2,0,6.283);c.stroke();ring(c,hx-L*0.04,hy-L*0.07,L*0.025,col);ring(c,hx+L*0.07,hy+L*0.02,Math.max(0.7,L*0.012),col);line(c,-bl/2,by-bh*0.2,-bl/2-L*0.04,by-bh*0.1,col);}
function walrus(c,L,col,ph){const s=1+Math.sin(ph)*0.05;c.strokeStyle=col;c.beginPath();c.ellipse(0,-L*0.13,L*0.38*s,L*0.13/s,0,0,6.283);c.stroke();ring(c,L*0.36,-L*0.2,L*0.09,col);line(c,L*0.38,-L*0.13,L*0.36,L*0.02,col);line(c,L*0.42,-L*0.13,L*0.42,L*0.02,col);ring(c,L*0.4,-L*0.23,Math.max(0.7,L*0.012),col);poly(c,[[L*0.1,-L*0.03],[L*0.22,0],[L*0.04,0]],col);poly(c,[[-L*0.36,-L*0.08],[-L*0.5,-L*0.02],[-L*0.46,-L*0.14]],col);}
function penguin(c,L,col,ph){c.save();c.rotate(Math.sin(ph*2)*0.15);c.strokeStyle=col;c.beginPath();c.ellipse(0,-L*0.42,L*0.18,L*0.4,0,0,6.283);c.stroke();c.beginPath();c.ellipse(L*0.06,-L*0.38,L*0.09,L*0.28,0,0,6.283);c.stroke();ring(c,L*0.06,-L*0.72,Math.max(0.6,L*0.03),col);poly(c,[[L*0.15,-L*0.68],[L*0.3,-L*0.64],[L*0.15,-L*0.6]],col);line(c,-L*0.12,-L*0.55,-L*0.24,-L*0.3+Math.sin(ph*3)*L*0.05,col);line(c,0,0,L*0.12,0,col);c.restore();}
function swimmer(c,kind,L,col,ph){const w=Math.sin(ph)*L*0.04;c.strokeStyle=col;
  if(kind==='battle'){c.beginPath();c.moveTo(L/2,0);c.quadraticCurveTo(L*0.3,-L*0.16,-L*0.1,-L*0.12);c.quadraticCurveTo(-L*0.35,-L*0.06,-L*0.4,w);c.quadraticCurveTo(-L*0.3,L*0.06,0,L*0.1);c.quadraticCurveTo(L*0.35,L*0.1,L/2,0);c.stroke();poly(c,[[0,-L*0.14],[-L*0.04,-L*0.38],[-L*0.12,-L*0.12]],col);c.beginPath();c.ellipse(L*0.3,-L*0.04,L*0.05,L*0.02,0,0,6.283);c.stroke();poly(c,[[-L*0.4,w],[-L*0.52,w-L*0.12],[-L*0.48,w],[-L*0.52,w+L*0.12]],col);}
  else{c.beginPath();c.moveTo(L/2,-L*0.02);c.quadraticCurveTo(L*0.3,-L*0.13,-L*0.2,-L*0.06);c.quadraticCurveTo(-L*0.42,w,-L*0.45,w);c.quadraticCurveTo(-L*0.2,L*0.08,L*0.3,L*0.08);c.closePath();c.stroke();ring(c,L*0.38,-L*0.05,Math.max(0.6,L*0.015),col);poly(c,[[L*0.1,L*0.06],[-L*0.02,L*0.2],[-L*0.04,L*0.07]],col);poly(c,[[-L*0.45,w],[-L*0.56,w-L*0.08],[-L*0.56,w+L*0.08]],col);}}
function puffin(c,L,col,ph){const f=Math.sin(ph*4);c.strokeStyle=col;c.beginPath();c.ellipse(0,0,L*0.32,L*0.18,0,0,6.283);c.stroke();ring(c,L*0.32,-L*0.1,L*0.12,col);poly(c,[[L*0.42,-L*0.14],[L*0.62,-L*0.06],[L*0.42,0]],'#e07800');line(c,-L*0.05,-L*0.05,-L*0.2,-L*0.05-f*L*0.45,col);line(c,-L*0.2,-L*0.05-f*L*0.45,-L*0.3,-L*0.02-f*L*0.3,col);}
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000)*MOTION,t=now/1000;last=now;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.drawImage(bg,0,0,W,H);
  ctx.strokeStyle='rgba(18,58,74,.55)';ctx.lineWidth=1.3;ctx.beginPath();for(let x=0;x<=W;x+=4){const y=WL+Math.sin(x/30+t)*1.5*T;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
  floes.forEach((f,i)=>{const b=Math.sin(t*0.8+i)*1.5*T;f.yy=f.y+b;ctx.lineWidth=1.3;ctx.fillStyle='#fbfdfe';ctx.beginPath();ctx.moveTo(f.x0,f.yy);ctx.lineTo(f.x1,f.yy);ctx.lineTo(f.x1-6*T,WL+10*T+b);ctx.lineTo(f.x0+8*T,WL+12*T+b);ctx.closePath();ctx.fill();ctx.strokeStyle=INK;ctx.stroke();});
  const ic=bg.ice;frozen.forEach(p=>{ctx.save();ctx.translate(p._x,p._y);ctx.lineWidth=1.1;ctx.globalAlpha=0.8;const k=p.kind;if(k==='tug')penguin(ctx,p._L*1.2,p.color,0);else if(k==='battle'||k==='speed')swimmer(ctx,k,p._L*1.6,p.color,0);else if(k==='sail')puffin(ctx,p._L,p.color,0);else if(k==='tanker')walrus(ctx,p._L*1.4,p.color,0);else quad4(ctx,p._L*1.3,p.color,0);ctx.restore();});ctx.globalAlpha=1;
  label(ctx,'Iceberg, 90 days or more',ic.x+ic.w,ic.y+ic.h+16*T,'right',10*T);
  for(const c of cr){const sp=SP[c.p.kind],L=sp.L*c.p.sizeF*S*(sp.zone==='ice'?0.72:1);c.ph+=dt*(1.5+c.v*0.12);ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.lineCap='round';let x,y;
    if(sp.zone==='ice'){const f=floes[c.floe],span=(f.x1-f.x0)-L;if(c.p.kind==='tug'&&Math.sin(t*0.3+c.wob)>0.95)c.slide=1.5;c.slide=Math.max(0,(c.slide||0)-dt);const v=c.v*(c.slide>0?4:1);c.x+=c.dir*v*T*dt/Math.max(20,span);if(c.x>1){c.x=1;c.dir=-1;}if(c.x<0){c.x=0;c.dir=1;}x=f.x0+L/2+c.x*span;y=f.yy;}
    else if(sp.zone==='sea'){c.x+=c.dir*c.v*T*dt/W;const m=L/W+0.03;if(c.x>1+m)c.x=-m;if(c.x<-m)c.x=1+m;x=c.x*W;y=WL+H*0.08+c.y*(H*0.5)+Math.sin(t*0.6+c.wob)*4*T;}
    else{c.x+=c.dir*c.v*T*dt/W;const m=0.05;if(c.x>1+m)c.x=-m;if(c.x<-m)c.x=1+m;x=c.x*W;y=H*0.12+c.y*(WL-H*0.22)+Math.sin(t*1.2+c.wob)*6*T;}
    c._x=x;c._y=sp.zone==='ice'?y-L*0.25:y;c._L=L;
    ctx.save();ctx.translate(x,y);ctx.scale(c.dir,1);const k=c.p.kind,col=c.p.color;
    if(k==='tanker')walrus(ctx,L,col,c.ph);else if(k==='cargo')quad4(ctx,L,col,c.ph);else if(k==='tug'){if(c.slide>0){ctx.rotate(-1.4);ctx.translate(0,L*0.2);}penguin(ctx,L,col,c.ph);}else if(k==='sail')puffin(ctx,L,col,c.ph);else swimmer(ctx,k,L,col,c.ph);
    ctx.restore();}
  ctx.strokeStyle='rgba(18,58,74,.35)';ctx.lineWidth=1;for(const s of snow){s.y+=s.v*dt;if(s.y>1)s.y=0;const x=s.x*W+Math.sin(t+s.x*20)*6,y=s.y*WL;line(ctx,x-2,y,x+2,y,'rgba(18,58,74,.3)');line(ctx,x,y-2,x,y+2,'rgba(18,58,74,.3)');}
  const s=VZ.sel;if(s&&s.ref)VZ.selRing(ctx,s.ref._x,s.ref._y,s.ref._L*0.55+6);
  requestAnimationFrame(frame);
}
cv.addEventListener('pointerdown',e=>{let best=null,bd=1e9;const X=e.clientX,Y=e.clientY;
  const test=(o,p)=>{if(o._x==null)return;const d=Math.hypot(X-o._x,Y-o._y);if(d<Math.max(o._L*0.55,14)&&d<bd){bd=d;best=[o,p];}};
  for(const c of cr)test(c,c.p);for(const p of frozen)test(p,p);
  if(best){const [o,p]=best;VZ.open({ref:o,title:p.name,kind:(p.old?'Frozen in the iceberg':SP[p.kind].label)+VZ.sizeText(p),age:VZ.ageText(p),host:p.host});}else VZ.close();});
addEventListener('resize',resize);resize();requestAnimationFrame(frame);
});
