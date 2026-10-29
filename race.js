VZ.load(P=>{
const {h32,poly,line,box,ring,label,INK,MOTION}=VZ;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const RK={tanker:'Stock car, one of the biggest',battle:'Formula car, big and fast',cargo:'Rally car, big and steady',tug:'Kart, small and nimble',speed:'Sprint car, small and quick',sail:'Roadster, light and easy'};
const run=P.filter(p=>!p.old).sort((a,b)=>(a.days??999)-(b.days??999)),pit=P.filter(p=>p.old);
document.getElementById('count').textContent=run.length+' racing, '+pit.length+' in the pits';
let W,H,DPR,T,cx,cy,rx,ry,LEN,head=0,LANE;
function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;T=Math.max(0.85,Math.min(1.3,Math.min(W,H)/360));
  cx=W/2;cy=(H+80)/2;rx=W*0.38;ry=(H-80)*0.4;LANE=8*T;LEN=2*Math.PI*Math.sqrt((rx*rx+ry*ry)/2)+2*(ry-rx)*0;}
function stadium(s){const L=LEN,u=((s%L)+L)%L/L*6.2832;const a=-Math.PI/2+u;const x=cx+rx*Math.cos(a),y=cy+ry*Math.sin(a)*0.85+ry*0.15*Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),3);const ta=Math.atan2(ry*Math.cos(a),-rx*Math.sin(a));return [x,y,ta];}
function car(c,kind,L,col){c.lineWidth=1.1;c.lineJoin='round';const w=L*0.32;
  for(const [x,s] of [[L*0.3,1],[L*0.3,-1],[-L*0.3,1],[-L*0.3,-1]])box(c,x-L*0.08,s*w*0.75-L*0.05,x+L*0.08,s*w*0.75+L*0.05,col);
  if(kind==='battle'){box(c,L*0.42,-w,L*0.5,w,col);box(c,-L*0.5,-w*0.9,-L*0.42,w*0.9,col);poly(c,[[L*0.45,0],[L*0.1,-w*0.35],[-L*0.4,-w*0.45],[-L*0.4,w*0.45],[L*0.1,w*0.35]],col);ring(c,0,0,w*0.22,col);}
  else{const r=kind==='tug'?0.2:0.35;poly(c,[[L*0.48,-w*0.5],[L*0.48,w*0.5],[-L*0.46,w*0.6],[-L*0.46,-w*0.6]],col);box(c,-L*0.12,-w*0.4,L*0.15,w*0.4,col);if(kind==='tanker'||kind==='cargo'){line(c,L*0.2,0,L*0.45,0,col);}}}
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000)*MOTION,t=now/1000;last=now;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#f3f4ef';ctx.fillRect(0,0,W,H);
  ctx.lineWidth=1.3;ctx.strokeStyle='rgba(18,58,74,.55)';for(const off of [-1.6,1.6]){ctx.beginPath();for(let s=0;s<=LEN;s+=4){const [x,y,a]=stadium(s);const nx=-Math.sin(a),ny=Math.cos(a);const X=x+nx*off*LANE,Y=y+ny*off*LANE;if(s===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);}ctx.closePath();ctx.stroke();}
  ctx.setLineDash([6,8]);ctx.strokeStyle='rgba(18,58,74,.2)';ctx.beginPath();for(let s=0;s<=LEN;s+=4){const [x,y]=stadium(s);if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();ctx.setLineDash([]);
  const [sx,sy,sa]=stadium(0);for(let k=-3;k<3;k++)for(let m=0;m<2;m++){if((k+m)%2)continue;const nx=-Math.sin(sa),ny=Math.cos(sa);const px=sx+nx*(k+0.5)*LANE*0.55+Math.cos(sa)*m*4,py=sy+ny*(k+0.5)*LANE*0.55+Math.sin(sa)*m*4;ctx.fillStyle=INK;ctx.fillRect(px-2,py-2,4,4);}
  label(ctx,'Start and finish',sx,sy-2.2*LANE,'center',10*T);
  ctx.strokeStyle='rgba(18,58,74,.35)';ctx.lineWidth=1.2;ctx.strokeRect(W*0.08,cy-ry*0.95,8*T,ry*1.9);ctx.strokeRect(W*0.92-8*T,cy-ry*0.95,8*T,ry*1.9);for(let y=cy-ry*0.9;y<cy+ry*0.9;y+=6*T){line(ctx,W*0.08,y,W*0.08+8*T,y,'rgba(18,58,74,.2)');line(ctx,W*0.92-8*T,y,W*0.92,y,'rgba(18,58,74,.2)');}
  const pw=rx*0.9,ph=ry*1.2;ctx.strokeStyle='rgba(18,58,74,.5)';ctx.strokeRect(cx-pw/2,cy-ph/2,pw,ph);ctx.setLineDash([4,4]);line(ctx,cx,cy-ph/2,cx,cy+ph/2,'rgba(18,58,74,.3)');ctx.setLineDash([]);
  label(ctx,'Pit lane, 90 days or more',cx,cy-ph/2-6*T,'center',10*T);
  const gl=Math.min(pw/2-8*T,24*T),gh=ph/Math.ceil(pit.length/2);pit.forEach((p,i)=>{const col=i%2,row=Math.floor(i/2),x=cx+(col?1:-1)*pw*0.25,y=cy-ph/2+gh*(row+0.5);box(ctx,x-gl*0.55,y-gh*0.42,x+gl*0.55,y+gh*0.42,'rgba(18,58,74,.25)');ctx.save();ctx.translate(x,y);ctx.rotate(col?Math.PI:0);car(ctx,p.kind,Math.min(gl,gh*1.2),p.color);ctx.restore();p._x=x;p._y=y;p._L=gl;});
  head+=dt*60*T;const n=run.length,gap=LEN/Math.ceil(n/2)*0.92,L=Math.min(gap*0.8,16*T);
  run.forEach((p,i)=>{const row=Math.floor(i/2),side=i%2?1:-1,s=head-row*gap+Math.sin(t*0.8+i)*gap*0.1;const [x,y,a]=stadium(s);const nx=-Math.sin(a),ny=Math.cos(a);const X=x+nx*side*LANE*0.6,Y=y+ny*side*LANE*0.6;p._x=X;p._y=Y;p._L=L;p.pos=i+1;
    ctx.save();ctx.translate(X,Y);ctx.rotate(a);car(ctx,p.kind,L*Math.min(1.15,p.sizeF),p.color);ctx.restore();
    if(i===0){label(ctx,'P1',X,Y-L,'center',10*T);}});
  const s=VZ.sel;if(s&&s.ref)VZ.selRing(ctx,s.ref._x,s.ref._y,Math.max(10,s.ref._L*0.7));
  requestAnimationFrame(frame);
}
cv.addEventListener('pointerdown',e=>{let best=null,bd=1e9;const X=e.clientX,Y=e.clientY;
  for(const p of run.concat(pit)){if(p._x==null)continue;const d=Math.hypot(X-p._x,Y-p._y);if(d<Math.max(p._L*0.8,12)&&d<bd){bd=d;best=p;}}
  if(best)VZ.open({ref:best,title:best.name,kind:(best.old?'In the pit lane':RK[best.kind]+', position '+best.pos+' of '+run.length)+VZ.sizeText(best),age:VZ.ageText(best),host:best.host});else VZ.close();});
addEventListener('resize',resize);resize();requestAnimationFrame(frame);
});
