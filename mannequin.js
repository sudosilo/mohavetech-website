VZ.load(P=>{
const {h32,MOTION,INK}=VZ;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let W,H,DPR,yaw=0.5,pitch=0.12,dist=2.4,auto=true,idle=0,last=performance.now();

/* body profile: half width and depth of the cross section at height y */
function body(y){
  const k=[[0.0,0.07,0.07],[0.62,0.145,0.095],[0.75,0.165,0.11],[0.9,0.188,0.125],[1.0,0.16,0.11],[1.1,0.112,0.083],[1.2,0.13,0.092],[1.3,0.145,0.1],[1.4,0.185,0.09],[1.47,0.13,0.07],[1.53,0.05,0.05]];
  for(let i=1;i<k.length;i++)if(y<=k[i][0]){const a=k[i-1],b=k[i],t=(y-a[0])/(b[0]-a[0]);return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
  return [0.05,0.05];
}
/* the gown: follows the body down to the hips, then flares out to the hem */
const TOP=1.44,HEM=0.66;
function gown(y){const b=body(y);return [b[0]+0.006,b[1]+0.006];}
/* bust in front, seat in back, added on top of the round cross section */
function bump(u,y){
  const f=Math.cos(u),sd=Math.sin(u);let r=0;
  if(f>0)r+=0.048*Math.exp(-Math.pow((y-1.27)/0.055,2))*(Math.exp(-Math.pow((sd-0.42)/0.22,2))+Math.exp(-Math.pow((sd+0.42)/0.22,2)))*f;
  if(f<0)r+=0.03*Math.exp(-Math.pow((y-0.88)/0.08,2))*(-f);
  return r;
}
/* newest apps up top, oldest at the hem: an ombre gown */
const apps=P.slice().sort((a,b)=>(a.days==null?1e9:a.days)-(b.days==null?1e9:b.days));
const notes=[];
(function(){
  let len=0,prev=null;const steps=200,ys=[];
  for(let i=0;i<=steps;i++){const y=TOP-(TOP-HEM)*i/steps,g=gown(y),pt=[g[0],y];if(prev)len+=Math.hypot(pt[0]-prev[0],pt[1]-prev[1]);ys.push([len,y]);prev=pt;}
  const circ=y=>{const g=gown(y);return Math.PI*(3*(g[0]+g[1])-Math.sqrt((3*g[0]+g[1])*(g[0]+3*g[1])));};
  let area=0;for(let i=1;i<ys.length;i++)area+=(ys[i][0]-ys[i-1][0])*circ(ys[i][1]);
  const cell=Math.sqrt(area/apps.length),rows=Math.max(4,Math.round(len/cell));
  const plan=[];let total=0;
  for(let r=0;r<rows;r++){const s=(r+0.5)/rows*len;let y=ys[ys.length-1][1];for(const q of ys)if(q[0]>=s){y=q[1];break;}const n=Math.max(3,circ(y)/cell);plan.push([y,n]);total+=n;}
  let k=0;
  plan.forEach(([y,n],r)=>{
    const cnt=r===plan.length-1?apps.length-k:Math.min(apps.length-k,Math.round(n*apps.length/total));
    for(let i=0;i<cnt;i++){const p=apps[k++];notes.push({p,y,u:(i+(r%2?0.5:0))/cnt*6.2832,row:r,size:cell*1.06,tilt:(h32(p.name,9)-0.5)*0.22,curl:0.04+0.1*h32(p.name,11),ph:h32(p.name,12)*6.28});}
  });
})();
document.getElementById('count').textContent=notes.length+' sticky notes, newest at the top';

function surf(fn,u,y,out){const g=fn(y),b=bump(u,y);const x=Math.sin(u)*(g[0]+b*Math.abs(Math.sin(u))),z=Math.cos(u)*(g[1]+b);return [x*(1+out),y,z*(1+out)];}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function norm(a){const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}

let cam;
function setCam(){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);cam={cy,sy,cp,sp,f:Math.min(H*0.95,W*2.2)};}
function proj(v){
  let x=v[0],y=v[1]-0.88,z=v[2];
  const x1=x*cam.cy-z*cam.sy,z1=x*cam.sy+z*cam.cy;
  const y2=y*cam.cp-z1*cam.sp,z2=y*cam.sp+z1*cam.cp;
  const d=dist-z2,s=cam.f/d;
  return [W/2+x1*s,H*0.52-y2*s,d];
}
function eyeDir(v){const ex=Math.sin(yaw)*Math.cos(pitch)*dist,ey=0.88+Math.sin(pitch)*dist,ez=Math.cos(yaw)*Math.cos(pitch)*dist;return norm([ex-v[0],ey-v[1],ez-v[2]]);}
function line3(a,b,col,w){const p=proj(a),q=proj(b);ctx.strokeStyle=col;ctx.lineWidth=w||1;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}
function ringAt(fn,y,col,w){ctx.strokeStyle=col;ctx.lineWidth=w||1;ctx.beginPath();for(let i=0;i<=40;i++){const p=proj(surf(fn,i/40*6.2832,y,0));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}
function limb(a,b,r,col){
  const d=norm(sub(b,a)),side=norm(cross(d,[0,0,1])),up=cross(side,d);
  for(let k=0;k<4;k++){const ang=k/4*6.2832,o=[side[0]*Math.cos(ang)*r+up[0]*Math.sin(ang)*r,side[1]*Math.cos(ang)*r+up[1]*Math.sin(ang)*r,side[2]*Math.cos(ang)*r+up[2]*Math.sin(ang)*r];line3([a[0]+o[0],a[1]+o[1],a[2]+o[2]],[b[0]+o[0],b[1]+o[1],b[2]+o[2]],col,1);}
  for(let t=0;t<=1;t+=0.25){const c=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];ctx.strokeStyle=col;ctx.beginPath();for(let i=0;i<=16;i++){const ang=i/16*6.2832,v=[c[0]+side[0]*Math.cos(ang)*r+up[0]*Math.sin(ang)*r,c[1]+side[1]*Math.cos(ang)*r+up[1]*Math.sin(ang)*r,c[2]+side[2]*Math.cos(ang)*r+up[2]*Math.sin(ang)*r];const p=proj(v);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}
}
const LINE='rgba(18,58,74,.55)',FAINT='rgba(18,58,74,.22)';
function stand(){
  ctx.strokeStyle=FAINT;ctx.lineWidth=1;
  for(const r of [0.32,0.22]){ctx.beginPath();for(let i=0;i<=48;i++){const a=i/48*6.2832,p=proj([Math.sin(a)*r,0,Math.cos(a)*r]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}
  for(let i=0;i<8;i++){const a=i/8*6.2832;line3([Math.sin(a)*0.22,0,Math.cos(a)*0.22],[Math.sin(a)*0.32,0,Math.cos(a)*0.32],FAINT);}
  line3([0,0,-0.18],[0,0.6,-0.1],LINE,1.4);
}
function legs(){for(const s of [-1,1]){limb([s*0.07,0.05,0.01],[s*0.075,0.36,0.0],0.042,LINE);limb([s*0.075,0.36,0.0],[s*0.08,HEM+0.04,0],0.062,LINE);}}
function torsoLines(){for(let y=1.5;y>=HEM;y-=0.06)ringAt(body,y,FAINT);for(let i=0;i<8;i++){const u=i/8*6.2832;ctx.strokeStyle=FAINT;ctx.beginPath();for(let y=1.56;y>=HEM;y-=0.04){const p=proj(surf(body,u,y,0));y===1.56?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1]);}ctx.stroke();}}
function arms(front){
  for(const s of [-1,1]){
    const sh=[s*0.19,1.41,0],el=[s*0.25,1.1,0.02],wr=[s*0.27,0.84,0.08];
    const zc=proj(el)[2],zt=proj([0,1.12,0])[2];
    if((zc<zt)===front)limb(sh,el,0.045,LINE),limb(el,wr,0.038,LINE);
  }
}
function head(){
  const c=[0,1.68,0],r=0.105;
  for(let k=0;k<6;k++){const lat=-1.2+k*0.48;ctx.strokeStyle=LINE;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=24;i++){const a=i/24*6.2832,p=proj([c[0]+Math.sin(a)*Math.cos(lat)*r*0.85,c[1]+Math.sin(lat)*r*1.15,c[2]+Math.cos(a)*Math.cos(lat)*r]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}
  for(let k=0;k<10;k++){const a=k/10*6.2832;ctx.beginPath();for(let i=0;i<=24;i++){const lat=-1.57+i/24*3.1416,p=proj([c[0]+Math.sin(a)*Math.cos(lat)*r*0.85*Math.cos(i/24*6.2832)*0+Math.sin(a)*Math.cos(lat)*r*0.85,c[1]+Math.sin(lat)*r*1.15,c[2]+Math.cos(a)*Math.cos(lat)*r]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}
  limb([0,1.5,0],[0,1.6,0],0.04,LINE);
}
function noteQuad(n,t){
  const out=0.002*(n.row%2+1);
  const c=surf(gown,n.u,n.y,out),du=0.01,dy=0.01;
  const tu=norm(sub(surf(gown,n.u+du,n.y,out),c)),tv=norm(sub(surf(gown,n.u,n.y-dy,out),c));
  const nrm=norm(cross(tv,tu));
  const ct=Math.cos(n.tilt),st=Math.sin(n.tilt),h=n.size;
  const ax=[tu[0]*ct+tv[0]*st,tu[1]*ct+tv[1]*st,tu[2]*ct+tv[2]*st],ay=[tv[0]*ct-tu[0]*st,tv[1]*ct-tu[1]*st,tv[2]*ct-tu[2]*st];
  const sway=n.curl*(1+0.35*Math.sin(t*1.6+n.ph)*MOTION);
  const P=(a,b,lift)=>[c[0]+ax[0]*a*h+ay[0]*(b*h-h*0.15)+nrm[0]*lift,c[1]+ax[1]*a*h+ay[1]*(b*h-h*0.15)+nrm[1]*lift,c[2]+ax[2]*a*h+ay[2]*(b*h-h*0.15)+nrm[2]*lift];
  const lift=h*0.55*sway;
  return {pts:[P(-0.5,-0.5,0),P(0.5,-0.5,0),P(0.5,0.35,lift*0.35),P(0.15,0.5,lift),P(-0.5,0.5,lift*0.5)],c,nrm};
}
let drawn=[];
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(auto)yaw+=dt*0.22*MOTION;else if((idle+=dt)>6)auto=true;
  const t=now/1000;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#f3f1ee';ctx.fillRect(0,0,W,H);
  setCam();ctx.lineJoin='round';ctx.lineCap='round';
  stand();legs();torsoLines();arms(false);
  const list=notes.map(n=>{const q=noteQuad(n,t),pp=q.pts.map(proj);let z=0;for(const p of pp)z+=p[2];const face=eyeDir(q.c);return {n,pp,z:z/pp.length,front:face[0]*q.nrm[0]+face[1]*q.nrm[1]+face[2]*q.nrm[2]>0};});
  list.sort((a,b)=>b.z-a.z);
  for(const d of list){
    const col=d.n.p.base||d.n.p.color;
    ctx.beginPath();d.pp.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
    ctx.globalAlpha=d.front?0.92:0.6;ctx.fillStyle=d.front?d.n.p.color:'#fbf6e4';ctx.fill();ctx.globalAlpha=1;
    ctx.lineWidth=1;ctx.strokeStyle=d.front?'rgba(18,58,74,.7)':col;ctx.stroke();
    if(d.front){const a=d.pp[3],b=d.pp[2],e=d.pp[4];ctx.strokeStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.moveTo((a[0]+b[0])/2,(a[1]+b[1])/2);ctx.lineTo((a[0]+e[0])/2,(a[1]+e[1])/2);ctx.stroke();}
  }
  drawn=list;
  arms(true);head();
  const sel=VZ.sel;
  if(sel&&sel.ref){const d=list.find(x=>x.n===sel.ref);if(d){let x=0,y=0;d.pp.forEach(p=>{x+=p[0];y+=p[1];});VZ.selRing(ctx,x/d.pp.length,y/d.pp.length,22);}}
  requestAnimationFrame(frame);
}
function inside(pt,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function pick(x,y){for(let i=drawn.length-1;i>=0;i--)if(inside([x,y],drawn[i].pp))return drawn[i].n;return null;}

const ptrs=new Map();let moved=0,pinch0=0,dist0=dist;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);moved=0;auto=false;idle=0;if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1]);dist0=dist;}});
cv.addEventListener('pointermove',e=>{
  if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];ptrs.set(e.pointerId,[e.clientX,e.clientY]);idle=0;
  if(ptrs.size===1){moved+=Math.abs(dx)+Math.abs(dy);yaw-=dx*0.008;pitch=Math.max(-0.6,Math.min(1.1,pitch+dy*0.006));}
  else if(ptrs.size===2){moved=99;const [a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch0)dist=Math.max(0.9,Math.min(6,dist0*pinch0/d));}
});
function up(e){if(ptrs.size===1&&moved<8){const n=pick(e.clientX,e.clientY);if(n){const p=n.p;VZ.open({ref:n,title:p.name,kind:p.itch?'Sticky note, also on itch.io':'Sticky note',age:VZ.ageText(p),host:p.host});}else VZ.close();}ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=0;}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);pinch0=0;});
cv.addEventListener('wheel',e=>{e.preventDefault();auto=false;idle=0;dist=Math.max(0.9,Math.min(6,dist*Math.exp(e.deltaY*0.0012)));},{passive:false});
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;}
addEventListener('resize',resize);resize();requestAnimationFrame(frame);
});
