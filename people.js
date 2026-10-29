VZ.load(P=>{
const {h32,poly,line,box,ring,label,INK,MOTION}=VZ;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const AC={tanker:{label:'Stilt walker, one of the biggest',v:8},battle:{label:'Jogger, big and fast',v:30},cargo:{label:'Pushing a stroller, big and steady',v:9},tug:{label:'Dancer, small and nimble',v:3},speed:{label:'Cyclist, small and quick',v:40},sail:{label:'Strolling, light and easy',v:11}};
const act=P.filter(p=>!p.old),sit=P.filter(p=>p.old);
document.getElementById('count').textContent=act.length+' in the park, '+sit.length+' on the benches';
const ROWS=6;let W,H,DPR,S,T,HOR,bg;
const rowY=r=>H*(0.36+r*0.1),rowS=r=>0.62+0.08*r;
const ps=act.map(p=>({p,row:Math.floor(h32(p.name,90)*ROWS),x:h32(p.name,91),dir:h32(p.name,92)>0.5?1:-1,ph:h32(p.name,93)*6,wob:h32(p.name,94)*6,flipT:3+h32(p.name,95)*5,v:AC[p.kind].v*(0.85+p.speed*0.3)}));
const kiter=ps.find(a=>a.p.kind==='sail');
function build(){
  bg=document.createElement('canvas');bg.width=W*DPR;bg.height=H*DPR;const g=bg.getContext('2d');g.scale(DPR,DPR);
  g.fillStyle='#f7f9fa';g.fillRect(0,0,W,HOR);g.fillStyle='#f6f0e2';g.fillRect(0,HOR,W,H-HOR);
  g.strokeStyle='#8a7550';g.lineWidth=1.3;g.beginPath();g.moveTo(0,HOR);g.lineTo(W,HOR);g.stroke();
  g.strokeStyle='rgba(18,58,74,.35)';for(let i=0;i<9;i++){const x=W*(i/8),w=(18+h32('bw'+i,1)*26)*T,h=(30+h32('bh'+i,2)*60)*T;g.strokeRect(x-w/2,HOR-h,w,h);}
  for(let i=0;i<5;i++){const x=W*(0.1+i*0.2)+h32('tt'+i,3)*20,r=(12+h32('tr'+i,4)*8)*T;g.strokeStyle='#7f9f72';g.beginPath();g.arc(x,HOR+4*T-r-12*T,r,0,6.283);g.stroke();g.strokeStyle='rgba(18,58,74,.5)';g.beginPath();g.moveTo(x,HOR+4*T);g.lineTo(x,HOR+4*T-12*T);g.stroke();}
  g.strokeStyle='rgba(18,58,74,.18)';g.lineWidth=1;for(let i=0;i<14;i++){g.beginPath();g.moveTo(W*0.5+(i-7)*W*0.02,HOR+2);g.lineTo(W*0.5+(i-7)*W*0.16,H);g.stroke();}
  const by=H*0.955;g.strokeStyle='rgba(18,58,74,.55)';g.lineWidth=1.2;const bw=W*0.9/3;
  for(let i=0;i<3;i++){const x=W*0.05+i*bw;g.beginPath();g.moveTo(x+4,by-10*T);g.lineTo(x+bw-4,by-10*T);g.moveTo(x+4,by-20*T);g.lineTo(x+bw-4,by-20*T);g.moveTo(x+8,by-10*T);g.lineTo(x+8,by);g.moveTo(x+bw-8,by-10*T);g.lineTo(x+bw-8,by);g.stroke();}
}
function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;HOR=H*0.27;T=Math.max(0.85,Math.min(1.3,Math.min(W,H)/360));S=Math.max(0.9,Math.min(1.6,Math.sqrt(W*H/(act.length*1300))));
  sit.forEach((p,i)=>{p._x=W*0.07+(i+0.5)*(W*0.86/sit.length);p._y=H*0.955-18*T;p._L=22*T;});build();}
function limb(c,x,y,a1,l1,a2,l2,col){const kx=x+Math.sin(a1)*l1,ky=y+Math.cos(a1)*l1;c.strokeStyle=col;c.beginPath();c.moveTo(x,y);c.lineTo(kx,ky);c.lineTo(kx+Math.sin(a2)*l2,ky+Math.cos(a2)*l2);c.stroke();return [kx+Math.sin(a2)*l2,ky+Math.cos(a2)*l2];}
function person(c,kind,h,col,ph,t,seated){
  c.lineWidth=1.2;c.lineJoin='round';c.lineCap='round';
  let lift=0,hip=-h*0.47,lean=0,legA=0.5,armA=0.5,stilt=0;
  if(kind==='tanker'){stilt=h*0.5;}
  if(kind==='battle'){lean=0.18;legA=0.8;armA=0.9;}
  if(kind==='tug'){lift=-Math.max(0,Math.sin(ph*2))*h*0.12;}
  const by=lift-stilt;
  if(seated){hip=-h*0.3;line(c,0,by+hip,h*0.22,by+hip,col);line(c,h*0.22,by+hip,h*0.24,by,col);}
  else if(kind==='speed'){const r=h*0.2;ring(c,-h*0.32,-r,r,col);ring(c,h*0.32,-r,r,col);c.strokeStyle=col;c.beginPath();c.moveTo(-h*0.32,-r);c.lineTo(-h*0.05,-r);c.lineTo(h*0.12,-h*0.48);c.lineTo(-h*0.1,-h*0.48);c.closePath();c.moveTo(h*0.32,-r);c.lineTo(h*0.2,-h*0.58);c.lineTo(h*0.12,-h*0.58);c.stroke();
    hip=-h*0.5;for(const o of [0,Math.PI]){const px=-h*0.05+Math.cos(ph*2+o)*h*0.08,py=-r+Math.sin(ph*2+o)*h*0.08;c.globalAlpha=o?0.5:1;line(c,0,hip,(px)*0.5+h*0.06,(hip+py)/2,col);line(c,(px)*0.5+h*0.06,(hip+py)/2,px,py,col);}c.globalAlpha=1;}
  else{for(const o of [0,Math.PI]){c.globalAlpha=o?0.5:1;const a=Math.sin(ph+o)*legA,b=a-Math.max(0,Math.cos(ph+o))*0.7;const f=limb(c,0,by+hip,a,h*0.24,b,h*0.24,col);if(stilt)line(c,f[0],f[1],f[0]+Math.sin(a)*2,f[1]+stilt,col);else line(c,f[0],f[1],f[0]+h*0.07,f[1],col);}c.globalAlpha=1;}
  const sy=by+hip-h*0.32,sx=Math.sin(lean)*h*0.3;
  poly(c,[[-h*0.07,by+hip],[h*0.07,by+hip],[sx+h*0.09,sy],[sx-h*0.09,sy]],col);
  ring(c,sx+h*0.03,sy-h*0.12,h*0.1,col);line(c,sx-h*0.06,sy-h*0.18,sx+h*0.1,sy-h*0.2,col);
  if(seated){line(c,sx+h*0.05,sy+h*0.06,sx+h*0.28,sy+h*0.08,col);box(c,sx+h*0.22,sy-h*0.06,sx+h*0.36,sy+h*0.14,col);return;}
  if(kind==='tug'){for(const s of [1,-1]){const a=Math.PI+s*(0.5+0.4*Math.sin(t*6+s));limb(c,sx,sy+h*0.03,a,h*0.18,a+s*0.3,h*0.16,col);}}
  else if(kind==='cargo'){limb(c,sx,sy+h*0.03,1.1,h*0.18,1.6,h*0.16,col);const cx=sx+h*0.42;line(c,sx+h*0.32,sy+h*0.15,cx,sy+h*0.15,col);c.strokeStyle=col;c.beginPath();c.moveTo(cx,sy+h*0.15);c.lineTo(cx+h*0.05,by-h*0.12);c.lineTo(cx+h*0.4,by-h*0.12);c.arc(cx+h*0.3,by-h*0.25,h*0.13,0.5,-1.6,true);c.stroke();ring(c,cx+h*0.08,by-h*0.05,h*0.05,col);ring(c,cx+h*0.35,by-h*0.05,h*0.05,col);}
  else if(kind==='speed'){limb(c,sx,sy+h*0.03,1.2,h*0.16,1.5,h*0.14,col);}
  else{for(const o of [0,Math.PI]){c.globalAlpha=o?0.5:1;const a=-Math.sin(ph+o)*armA;limb(c,sx,sy+h*0.03,a,h*0.17,a+(kind==='battle'?-1.2:0.2),h*0.15,col);}c.globalAlpha=1;}
}
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000)*MOTION,t=now/1000;last=now;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.drawImage(bg,0,0,W,H);
  const fx=W*0.5,fy=HOR+H*0.06;ctx.lineWidth=1.2;ctx.strokeStyle=INK;ctx.beginPath();ctx.ellipse(fx,fy,34*T,6*T,0,0,6.283);ctx.stroke();line(ctx,fx,fy,fx,fy-20*T,INK);
  ctx.strokeStyle='rgba(47,111,214,.5)';for(let k=0;k<6;k++){const a=k/6*Math.PI-Math.PI/2+Math.sin(t*2)*0.05,len=(26+Math.sin(t*3+k)*2)*T;ctx.beginPath();ctx.moveTo(fx,fy-20*T);ctx.quadraticCurveTo(fx+Math.sin(a+Math.PI/2)*len*0.6,fy-38*T,fx+Math.sin(a+Math.PI/2)*len,fy-2*T);ctx.stroke();}
  label(ctx,'Fountain',fx,fy+16*T,'center',9.5*T);
  for(let r=0;r<ROWS;r++){const gy=rowY(r),rs=rowS(r);
    for(const a of ps){if(a.row!==r)continue;const h=26*S*rs*(a.p.kind==='tanker'?1:0.85+a.p.sizeF*0.15);
      let v=a.v;if(a.p.kind==='tug'){a.flipT-=dt;if(a.flipT<=0){a.dir*=-1;a.flipT=1.5+Math.random()*3;}}
      a.x+=a.dir*v*T*rs*dt/W;const m=0.08;if(a.x>1+m)a.x=-m;if(a.x<-m)a.x=1+m;
      a.ph+=dt*(1.6+v*0.15);const x=a.x*W;a._x=x;a._y=gy-h*(a.p.kind==='tanker'?0.9:0.5);a._L=h*(a.p.kind==='tanker'?1.5:1);
      ctx.save();ctx.translate(x,gy);ctx.scale(a.dir,1);person(ctx,a.p.kind,h,a.p.color,a.ph,t,false);ctx.restore();
      if(a===kiter){const kx=x+a.dir*h*0.2,ky=gy-h*0.75,tx=Math.min(W-20,Math.max(20,x+a.dir*W*0.18+Math.sin(t*0.7)*14*T)),ty=HOR*0.45+Math.sin(t*1.1)*10*T;ctx.strokeStyle='rgba(18,58,74,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(kx,ky);ctx.quadraticCurveTo((kx+tx)/2,ty+(ky-ty)*0.7,tx,ty);ctx.stroke();ctx.lineWidth=1.2;poly(ctx,[[tx,ty-12*T],[tx+8*T,ty],[tx,ty+12*T],[tx-8*T,ty]],a.p.color);line(ctx,tx,ty+12*T,tx-6*T+Math.sin(t*4)*3,ty+24*T,a.p.color);}
    }}
  for(const p of sit){ctx.save();ctx.translate(p._x,H*0.955-10*T);person(ctx,p.kind,24*T,p.color,0,t,true);ctx.restore();}
  const zt=t%3;ctx.globalAlpha=Math.max(0,1-zt/3);label(ctx,'z',W*0.3+zt*3,H*0.955-44*T-zt*7*T,'center',9*T);ctx.globalAlpha=1;
  label(ctx,'Benches, 90 days or more',W*0.05,H*0.955-50*T,'left',10*T);
  const s=VZ.sel;if(s&&s.ref)VZ.selRing(ctx,s.ref._x,s.ref._y,s.ref._L*0.55+6);
  requestAnimationFrame(frame);
}
cv.addEventListener('pointerdown',e=>{let best=null,bd=1e9;const X=e.clientX,Y=e.clientY;
  const test=(o,p)=>{if(o._x==null)return;const d=Math.hypot(X-o._x,Y-o._y);if(d<Math.max(o._L*0.55,14)&&d<bd){bd=d;best=[o,p];}};
  for(const a of ps)test(a,a.p);for(const p of sit)test(p,p);
  if(best){const [o,p]=best;VZ.open({ref:o,title:p.name,kind:(p.old?'Reading on a bench':AC[p.kind].label)+VZ.sizeText(p),age:VZ.ageText(p),host:p.host});}else VZ.close();});
addEventListener('resize',resize);resize();requestAnimationFrame(frame);
});
