VZ.load(P=>{
const {h32,poly,line,box,ring,label,INK,MUTED,MOTION}=VZ;
const SCENE=document.body.dataset.scene||'cats';
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const SPECIES={
 cats:{
  tanker:{label:'Lion, one of the biggest',L:48,bl:.55,bh:.22,ll:.26,nl:.08,na:.9,hl:.17,hh:.14,sn:.05,ear:'round',tail:'tuft',ex:['mane'],v:12},
  battle:{label:'Cheetah, big and fast',L:40,bl:.55,bh:.15,ll:.3,nl:.07,na:.7,hl:.12,hh:.09,sn:.03,ear:'round',tail:'long',ex:['spots'],v:42},
  cargo:{label:'Tiger, big and steady',L:44,bl:.58,bh:.2,ll:.24,nl:.07,na:.7,hl:.15,hh:.12,sn:.04,ear:'round',tail:'long',ex:['stripes'],v:15},
  tug:{label:'Kitten, small and nimble',L:14,bl:.45,bh:.2,ll:.2,nl:.05,na:1,hl:.22,hh:.19,sn:.02,ear:'pointy',tail:'up',ex:[],v:18,hop:1},
  speed:{label:'Tabby cat, small and quick',L:20,bl:.5,bh:.17,ll:.22,nl:.05,na:1,hl:.17,hh:.14,sn:.02,ear:'pointy',tail:'up',ex:['stripes'],v:26,zoom:1},
  sail:{label:'Persian cat, light and easy',L:21,bl:.5,bh:.24,ll:.15,nl:.05,na:1,hl:.19,hh:.17,sn:0,ear:'pointy',tail:'bushy',ex:['fluff'],v:9}
 },
 dogs:{
  tanker:{label:'Great Dane, one of the biggest',L:44,bl:.5,bh:.18,ll:.36,nl:.14,na:1,hl:.2,hh:.1,sn:.1,ear:'flop',tail:'wag',ex:['collar'],v:16},
  battle:{label:'Greyhound, big and fast',L:38,bl:.5,bh:.14,ll:.34,nl:.14,na:.8,hl:.18,hh:.07,sn:.1,ear:'fold',tail:'long',ex:['collar'],v:46},
  cargo:{label:'Saint Bernard, big and steady',L:42,bl:.55,bh:.25,ll:.24,nl:.08,na:.8,hl:.2,hh:.14,sn:.06,ear:'flop',tail:'bushy',ex:['patches','collar'],v:11},
  tug:{label:'Jack Russell, small and nimble',L:18,bl:.5,bh:.18,ll:.22,nl:.07,na:1,hl:.17,hh:.1,sn:.07,ear:'fold',tail:'wag',ex:['patches','collar'],v:22,hop:1},
  speed:{label:'Corgi, small and quick',L:22,bl:.6,bh:.2,ll:.12,nl:.05,na:.9,hl:.18,hh:.12,sn:.07,ear:'pointy',tail:'short',ex:['collar'],v:30,zoom:1},
  sail:{label:'Dachshund, light and easy',L:24,bl:.7,bh:.14,ll:.1,nl:.06,na:.8,hl:.2,hh:.08,sn:.1,ear:'flop',tail:'long',ex:['collar'],v:13}
 },
 farm:{
  tanker:{label:'Cow, one of the biggest',L:46,bl:.6,bh:.28,ll:.26,nl:.06,na:.4,hl:.2,hh:.11,sn:.05,ear:'side',tail:'tuft',ex:['patches','horns'],v:6},
  battle:{label:'Horse, big and fast',L:44,bl:.55,bh:.2,ll:.36,nl:.2,na:1.05,hl:.22,hh:.08,sn:.06,ear:'pointy',tail:'horse',ex:['mane2'],v:28},
  cargo:{label:'Donkey, big and steady',L:36,bl:.5,bh:.2,ll:.28,nl:.14,na:.9,hl:.22,hh:.09,sn:.05,ear:'long',tail:'tuft',ex:['mane2'],v:9},
  tug:{label:'Goat, small and nimble',L:22,bl:.45,bh:.17,ll:.26,nl:.1,na:1.1,hl:.15,hh:.07,sn:.05,ear:'side',tail:'short',ex:['goathorns','beard'],v:14,hop:1},
  speed:{label:'Pig, small and quick',L:24,bl:.55,bh:.26,ll:.12,nl:.02,na:.3,hl:.16,hh:.13,sn:.05,ear:'pointy',tail:'curly',ex:['pignose'],v:18,zoom:1},
  sail:{label:'Sheep, light and easy',L:24,bl:.5,bh:.26,ll:.18,nl:.05,na:.6,hl:.14,hh:.08,sn:.04,ear:'side',tail:'short',ex:['wool'],v:8}
 }
};
const SC={cats:{rest:'Porch, 90 days or more',walk:' walking, ',restWord:' napping on the porch'},dogs:{rest:'Doghouse, 90 days or more',walk:' at the park, ',restWord:' sleeping by the doghouse'},farm:{rest:'Barn, 90 days or more',walk:' in the pasture, ',restWord:' resting by the barn'}}[SCENE];
const SPC=SPECIES[SCENE];
const walkers=P.filter(p=>!p.old),rest=P.filter(p=>p.old);
document.getElementById('count').textContent=walkers.length+SC.walk+rest.length+SC.restWord;
let W,H,DPR,S,T,bg,HOR;
const ROWS=6;
const an=walkers.map(p=>({p,row:Math.floor(h32(p.name,60)*ROWS),x:h32(p.name,61),dir:h32(p.name,62)>0.5?1:-1,ph:h32(p.name,63)*6.28,wob:h32(p.name,64)*6.28,flipT:4+h32(p.name,65)*10,v:SPC[p.kind].v*(0.85+p.speed*0.3)}));
const rowY=r=>H*(0.34+r*0.103),rowS=r=>0.6+0.09*r;
function grassTicks(g,y0,y1,n){g.strokeStyle='#cfd8b8';g.lineWidth=1;for(let i=0;i<n;i++){const x=h32('gx'+i,1)*W,y=y0+h32('gy'+i,2)*(y1-y0);g.beginPath();g.moveTo(x-2,y);g.lineTo(x,y-3);g.lineTo(x+2,y);g.stroke();}}
function build(){
  bg=document.createElement('canvas');bg.width=W*DPR;bg.height=H*DPR;const g=bg.getContext('2d');g.scale(DPR,DPR);
  g.fillStyle='#f7f9fa';g.fillRect(0,0,W,HOR);g.fillStyle='#f6f0e2';g.fillRect(0,HOR,W,H-HOR);
  g.strokeStyle='rgba(224,120,0,.6)';g.lineWidth=1.2;g.beginPath();g.arc(W*0.82,HOR*0.42,14*T,0,6.283);g.stroke();
  for(let i=0;i<8;i++){const a=i/8*6.283;g.beginPath();g.moveTo(W*0.82+Math.cos(a)*18*T,HOR*0.42+Math.sin(a)*18*T);g.lineTo(W*0.82+Math.cos(a)*23*T,HOR*0.42+Math.sin(a)*23*T);g.stroke();}
  g.strokeStyle='rgba(18,58,74,.3)';g.beginPath();for(let x=0;x<=W;x+=4){const y=HOR-10*T-Math.sin(x/W*6.28*1.2+1)*14*T-Math.sin(x/W*6.28*3)*5*T;if(x===0)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();
  g.strokeStyle='#8a7550';g.lineWidth=1.3;g.beginPath();g.moveTo(0,HOR);g.lineTo(W,HOR);g.stroke();
  grassTicks(g,HOR+6,H,Math.round(W*H/2500));
  g.lineWidth=1.2;
  if(SCENE==='cats'){
    g.strokeStyle='rgba(18,58,74,.55)';for(let x=6;x<W;x+=16*T){g.beginPath();g.moveTo(x,HOR+2);g.lineTo(x,HOR-26*T);g.lineTo(x+4*T,HOR-31*T);g.lineTo(x+8*T,HOR-26*T);g.lineTo(x+8*T,HOR+2);g.stroke();}
    g.beginPath();g.moveTo(0,HOR-8*T);g.lineTo(W,HOR-8*T);g.moveTo(0,HOR-20*T);g.lineTo(W,HOR-20*T);g.stroke();
    const tx=W*0.86,ty=HOR+H*0.04;g.strokeStyle=INK;g.beginPath();g.moveTo(tx,ty);g.lineTo(tx,ty-60*T);g.moveTo(tx-16*T,ty);g.lineTo(tx-16*T,ty-34*T);g.stroke();g.strokeRect(tx-26*T,ty-36*T,22*T,4*T);g.strokeRect(tx-10*T,ty-62*T,22*T,4*T);g.beginPath();g.arc(tx+4*T,ty-20*T,5*T,0,6.283);g.stroke();
  }else if(SCENE==='dogs'){
    for(let i=0;i<6;i++){const x=W*(0.08+i*0.17)+h32('tr'+i,3)*20,r=(14+h32('tq'+i,4)*10)*T;g.strokeStyle='#7f9f72';g.beginPath();g.arc(x,HOR-r-10*T,r,0,6.283);g.stroke();g.strokeStyle='rgba(18,58,74,.5)';g.beginPath();g.moveTo(x,HOR);g.lineTo(x,HOR-12*T);g.stroke();}
    const hx=W*0.9,hy=HOR+H*0.05;g.strokeStyle='#d93636';g.strokeRect(hx-4*T,hy-14*T,8*T,14*T);g.beginPath();g.arc(hx,hy-14*T,4*T,Math.PI,0);g.moveTo(hx-7*T,hy-9*T);g.lineTo(hx+7*T,hy-9*T);g.stroke();
    g.strokeStyle=INK;g.strokeRect(W*0.62,HOR+H*0.03-8*T,40*T,3*T);g.beginPath();g.moveTo(W*0.62+4*T,HOR+H*0.03-5*T);g.lineTo(W*0.62+4*T,HOR+H*0.03+4*T);g.moveTo(W*0.62+36*T,HOR+H*0.03-5*T);g.lineTo(W*0.62+36*T,HOR+H*0.03+4*T);g.stroke();
  }else{
    const bx=W*0.1,by=HOR+2,bw=60*T,bh2=40*T;g.strokeStyle='#d93636';g.beginPath();g.moveTo(bx,by);g.lineTo(bx,by-bh2);g.lineTo(bx+bw*0.2,by-bh2-14*T);g.lineTo(bx+bw*0.8,by-bh2-14*T);g.lineTo(bx+bw,by-bh2);g.lineTo(bx+bw,by);g.stroke();
    g.strokeRect(bx+bw*0.3,by-24*T,bw*0.4,24*T);g.beginPath();g.moveTo(bx+bw*0.3,by-24*T);g.lineTo(bx+bw*0.7,by);g.moveTo(bx+bw*0.7,by-24*T);g.lineTo(bx+bw*0.3,by);g.stroke();
    g.strokeStyle=INK;g.strokeRect(bx+bw+4*T,by-56*T,14*T,56*T);g.beginPath();g.arc(bx+bw+11*T,by-56*T,7*T,Math.PI,0);g.stroke();
    g.strokeStyle='rgba(18,58,74,.5)';const ty=HOR-26*T;for(let x=-4;x<W;x+=6*T){g.beginPath();g.moveTo(x,ty-2*T);g.lineTo(x,ty+2*T);g.stroke();}g.beginPath();g.moveTo(0,ty-1.2*T);g.lineTo(W,ty-1.2*T);g.moveTo(0,ty+1.2*T);g.lineTo(W,ty+1.2*T);g.stroke();
    g.strokeStyle='rgba(18,58,74,.5)';for(let x=8;x<W;x+=22*T){g.beginPath();g.moveTo(x,HOR+H*0.05+10*T);g.lineTo(x,HOR+H*0.05-6*T);g.stroke();}g.beginPath();g.moveTo(0,HOR+H*0.05-2*T);g.lineTo(W,HOR+H*0.05-2*T);g.moveTo(0,HOR+H*0.05+4*T);g.lineTo(W,HOR+H*0.05+4*T);g.stroke();
  }
  g.strokeStyle='rgba(18,58,74,.45)';g.lineWidth=1.2;const ry=H*0.955;
  if(SCENE==='dogs'){const dx=W*0.04,dw=34*T;g.beginPath();g.moveTo(dx,ry);g.lineTo(dx,ry-24*T);g.lineTo(dx+dw/2,ry-36*T);g.lineTo(dx+dw,ry-24*T);g.lineTo(dx+dw,ry);g.stroke();g.beginPath();g.arc(dx+dw/2,ry,8*T,Math.PI,0);g.stroke();}
  else if(SCENE==='cats'){g.strokeRect(W*0.02,ry-2*T,W*0.55,6*T);for(let x=W*0.04;x<W*0.57;x+=W*0.1){g.beginPath();g.moveTo(x,ry+4*T);g.lineTo(x,ry+14*T);g.stroke();}}
  else{g.strokeStyle='#c49a00';for(let i=0;i<40;i++){const x=W*0.03+h32('hy'+i,7)*W*0.5,y=ry-h32('hz'+i,8)*8*T;g.beginPath();g.moveTo(x,y);g.lineTo(x+5*T,y-3*T);g.stroke();}}
}
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;HOR=H*0.25;
  T=Math.max(0.85,Math.min(1.3,Math.min(W,H)/360));S=Math.max(0.9,Math.min(1.8,Math.sqrt(W*H/(walkers.length*1150))));
  const x0=SCENE==='dogs'?W*0.04+40*T:W*0.04,span=W*0.55-(x0-W*0.04);
  rest.forEach((p,i)=>{p.rx=x0+(i+0.5)*span/rest.length;p.ry=H*0.955;});build();
}
function superE(c,cx,cy,rx,ry,col,bumps){
  c.beginPath();const n=bumps?bumps*2:28;
  for(let i=0;i<=n;i++){const a=i/n*6.283,ca=Math.cos(a),sa=Math.sin(a);let r=1;if(bumps)r=1+(i%2?0.12:0);const x=cx+rx*r*Math.sign(ca)*Math.pow(Math.abs(ca),0.75),y=cy+ry*r*Math.sign(sa)*Math.pow(Math.abs(sa),0.85);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}
  c.closePath();c.strokeStyle=col;c.stroke();
}
function drawAnimal(c,sp,L,col,ph,t,resting,seed){
  c.lineWidth=1.2;c.lineJoin='round';c.lineCap='round';
  const bl=sp.bl*L,bh=sp.bh*L,ll=resting?bh*0.15:sp.ll*L,hl=sp.hl*L,hh=sp.hh*L,nl=sp.nl*L,ex=sp.ex;
  const by=-(ll+bh/2);
  const far=(f)=>{c.globalAlpha=f?0.45:1;};
  const legs=(farPass)=>{
    if(resting){if(farPass)return;line(c,bl*0.15,-bh*0.15,bl*0.5,-bh*0.12,col);line(c,-bl*0.3,-bh*0.1,-bl*0.05,-bh*0.08,col);return;}
    const hipY=by+bh*0.3,seg=(ll+bh*0.2)/2*1.02,amp=0.45;
    for(const [hx,front,off] of [[bl*0.33,1,farPass?0:Math.PI],[-bl*0.33,0,farPass?Math.PI:0]]){
      const ps=ph+off,th=amp*Math.sin(ps),bend=(front?-1:1)*Math.max(0,Math.cos(ps))*0.8;
      const x0=hx+(farPass?bl*0.05:0),kx=x0+Math.sin(th)*seg,ky=hipY+Math.cos(th)*seg,fx=kx+Math.sin(th+bend)*seg,fy=Math.min(0,ky+Math.cos(th+bend)*seg);
      c.strokeStyle=col;c.beginPath();c.moveTo(x0,hipY);c.lineTo(kx,ky);c.lineTo(fx,fy);c.lineTo(fx+L*0.03,fy);c.stroke();
    }
  };
  far(1);legs(true);far(0);
  const bob=resting?0:Math.sin(ph*2)*hh*0.08;
  const nbx=bl*0.42,nby=by-bh*0.2;const na=resting?0.25:sp.na;
  const hx=nbx+nl*Math.cos(na)+hl*0.25,hy=(resting?-hh*0.6:nby-nl*Math.sin(na))+bob;
  const tx=-bl*0.47,ty=by-bh*0.25,sw=Math.sin(t*2+seed);
  c.strokeStyle=col;c.beginPath();
  const tl=sp.tail;
  if(tl==='long'){c.moveTo(tx,ty);c.quadraticCurveTo(tx-L*0.25,ty+L*0.12,tx-L*0.38,ty-L*0.05+sw*L*0.04);}
  else if(tl==='up'){c.moveTo(tx,ty);c.quadraticCurveTo(tx-L*0.15,ty-L*0.05,tx-L*0.12+sw*L*0.03,ty-L*0.28);}
  else if(tl==='wag'){const a=-1.1+Math.sin(t*14+seed)*0.35;c.moveTo(tx,ty);c.lineTo(tx+Math.cos(Math.PI+a)*L*0.22,ty+Math.sin(Math.PI+a)*L*0.22*-1);}
  else if(tl==='tuft'){const ex2=tx-L*0.08+sw*L*0.03,ey=ty+L*0.3;c.moveTo(tx,ty);c.quadraticCurveTo(tx-L*0.08,ty+L*0.1,ex2,ey);c.moveTo(ex2,ey);c.lineTo(ex2-L*0.03,ey+L*0.06);c.moveTo(ex2,ey);c.lineTo(ex2+L*0.03,ey+L*0.06);}
  else if(tl==='horse'){for(let k=0;k<4;k++){c.moveTo(tx,ty);c.quadraticCurveTo(tx-L*0.12,ty+L*0.05,tx-L*0.1-k*L*0.02+sw*L*0.03,ty+L*(0.28+k*0.02));}}
  else if(tl==='bushy'){c.moveTo(tx,ty);c.quadraticCurveTo(tx-L*0.2,ty-L*0.02,tx-L*0.24+sw*L*0.03,ty-L*0.2);c.quadraticCurveTo(tx-L*0.12,ty-L*0.14,tx,ty-bh*0.1);}
  else if(tl==='curly'){for(let i=0;i<=12;i++){const a=i/12*9,r=L*0.05*(1-i/14);const x=tx-L*0.04-Math.cos(a)*r,y=ty-L*0.02-Math.sin(a)*r;if(i===0)c.moveTo(tx,ty);c.lineTo(x,y);}}
  else{c.moveTo(tx,ty);c.lineTo(tx-L*0.06,ty-L*0.07);}
  c.stroke();
  if(ex.includes('wool')||ex.includes('fluff'))superE(c,0,by,bl/2,bh/2,col,ex.includes('wool')?14:20);else superE(c,0,by,bl/2,bh/2,col);
  if(ex.includes('spots'))for(let i=0;i<9;i++){const sx=(h32('s'+i,seed*7|0)-0.5)*bl*0.8,sy=by+(h32('t'+i,seed*7|0)-0.5)*bh*0.6;ring(c,sx,sy,Math.max(0.6,L*0.012),col);}
  if(ex.includes('stripes'))for(let i=0;i<6;i++){const sx=-bl*0.35+i*bl*0.13;c.beginPath();c.moveTo(sx,by-bh*0.48);c.quadraticCurveTo(sx+bl*0.03,by-bh*0.2,sx,by+bh*0.05);c.stroke();}
  if(ex.includes('patches'))for(let i=0;i<3;i++){const sx=(h32('p'+i,seed*5|0)-0.5)*bl*0.6,sy=by+(h32('q'+i,seed*5|0)-0.5)*bh*0.4,r=L*(0.04+h32('r'+i,seed*5|0)*0.04);c.beginPath();for(let k=0;k<=7;k++){const a=k/7*6.283,rr=r*(0.75+0.35*h32('k'+k+i,seed*3|0));if(k===0)c.moveTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr*0.7);else c.lineTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr*0.7);}c.closePath();c.stroke();}
  const nt=Math.min(hh*0.75,bh*0.45);
  c.beginPath();c.moveTo(nbx-nt*0.3,nby-nt*0.4);c.lineTo(hx-hl*0.25,hy-hh*0.3);c.moveTo(nbx+nt*0.5,nby+nt*0.6);c.lineTo(hx-hl*0.1,hy+hh*0.35);c.stroke();
  if(ex.includes('mane2'))for(let i=1;i<6;i++){const u=i/6,x=nbx-nt*0.3+(hx-hl*0.25-nbx+nt*0.3)*u,y=nby-nt*0.4+(hy-hh*0.3-nby+nt*0.4)*u;line(c,x,y,x-L*0.04,y-L*0.01+sw*L*0.01,col);}
  if(ex.includes('mane'))for(let i=0;i<18;i++){const a=Math.PI*0.35+i/18*Math.PI*1.3;line(c,hx-hl*0.1+Math.cos(a)*hh*0.55,hy+Math.sin(a)*hh*0.55,hx-hl*0.1+Math.cos(a)*hh*1.05,hy+Math.sin(a)*hh*1.05,col);}
  if(ex.includes('collar')){line(c,nbx+nt*0.1,nby-nt*0.5,nbx+nt*0.6,nby+nt*0.6,col);ring(c,nbx+nt*0.7,nby+nt*0.9,Math.max(0.8,L*0.015),col);}
  superE(c,hx,hy,hl/2,hh/2,col);
  if(sp.sn>0){const sn=sp.sn*L;poly(c,[[hx+hl*0.38,hy-hh*0.22],[hx+hl*0.38+sn,hy-hh*0.05],[hx+hl*0.38+sn,hy+hh*0.32],[hx+hl*0.3,hy+hh*0.42]],col);ring(c,hx+hl*0.38+sn,hy-hh*0.02,Math.max(0.7,L*0.01),col);}
  if(ex.includes('pignose')){c.strokeStyle=col;c.beginPath();c.ellipse(hx+hl*0.5+sp.sn*L,hy+hh*0.1,L*0.012,hh*0.28,0,0,6.283);c.stroke();}
  if(resting){line(c,hx+hl*0.05,hy-hh*0.12,hx+hl*0.22,hy-hh*0.12,col);}else ring(c,hx+hl*0.18,hy-hh*0.15,Math.max(0.7,L*0.012),col);
  if(ex.includes('beard'))line(c,hx+hl*0.3,hy+hh*0.45,hx+hl*0.2,hy+hh*1.1,col);
  const ex0=hx-hl*0.12,ey0=hy-hh*0.42,e=sp.ear;
  if(e==='pointy')poly(c,[[ex0-hl*0.12,ey0+hh*0.1],[ex0-hl*0.02,ey0-hh*0.55],[ex0+hl*0.12,ey0+hh*0.05]],col);
  else if(e==='round'){c.strokeStyle=col;c.beginPath();c.arc(ex0,ey0,hh*0.2,Math.PI,0);c.stroke();}
  else if(e==='flop')poly(c,[[ex0-hl*0.05,ey0+hh*0.05],[ex0-hl*0.22,ey0+hh*0.75],[ex0-hl*0.08,ey0+hh*0.85],[ex0+hl*0.08,ey0+hh*0.1]],col);
  else if(e==='fold')poly(c,[[ex0-hl*0.1,ey0+hh*0.1],[ex0,ey0-hh*0.3],[ex0+hl*0.15,ey0+hh*0.1]],col);
  else if(e==='long')poly(c,[[ex0-hl*0.12,ey0+hh*0.1],[ex0-hl*0.25,ey0-hh*1.6],[ex0-hl*0.02,ey0-hh*1.5],[ex0+hl*0.08,ey0+hh*0.05]],col);
  else poly(c,[[ex0,ey0+hh*0.15],[ex0-hl*0.35,ey0+hh*0.05],[ex0-hl*0.1,ey0+hh*0.4]],col);
  if(ex.includes('horns')){c.strokeStyle=col;c.beginPath();c.moveTo(ex0+hl*0.12,ey0);c.quadraticCurveTo(ex0+hl*0.3,ey0-hh*0.2,ex0+hl*0.22,ey0-hh*0.6);c.stroke();}
  if(ex.includes('goathorns')){c.strokeStyle=col;c.beginPath();c.moveTo(ex0+hl*0.1,ey0);c.quadraticCurveTo(ex0+hl*0.05,ey0-hh*1.3,ex0-hl*0.35,ey0-hh*0.9);c.stroke();}
}
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000)*MOTION,t=now/1000;last=now;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.drawImage(bg,0,0,W,H);
  if(SCENE==='farm'){const ty=HOR-26*T;for(let i=0;i<8;i++){const x=((t*20*T)%(W+200))-100-i*14*T;ctx.lineWidth=1.1;box(ctx,x-6*T,ty-9*T,x+6*T,ty-1*T,i===0?INK:'rgba(18,58,74,.55)');}label(ctx,'GitHub line',W*0.98,ty-14*T,'right',10*T);
    const wx=W*0.62,wy=HOR-6*T;line(ctx,wx,HOR,wx,wy-40*T,INK);for(let k=0;k<4;k++){const a=t*1.5+k*1.5708;line(ctx,wx,wy-40*T,wx+Math.cos(a)*16*T,wy-40*T+Math.sin(a)*16*T,INK);}}
  for(let r=0;r<ROWS;r++){
    const gy=rowY(r),rs=rowS(r);
    for(const a of an){if(a.row!==r)continue;const sp=SPC[a.p.kind],L=sp.L*a.p.sizeF*S*rs;
      let v=a.v;if(sp.zoom)v*=0.45+1.4*Math.pow(Math.max(0,Math.sin(t*0.45+a.wob)),2);
      let hop=0;if(sp.hop){hop=-Math.pow(Math.max(0,Math.sin(t*2.6+a.wob)),6)*L*0.35;a.flipT-=dt;if(a.flipT<=0){a.dir*=-1;a.flipT=5+Math.random()*9;}}
      a.x+=a.dir*v*T*rs*dt/W;const m=L/W+0.03;if(a.x>1+m)a.x=-m;if(a.x<-m)a.x=1+m;
      a.ph+=dt*(1.5+v*0.16);
      const x=a.x*W,y=gy+hop;a._x=x;a._y=y-L*0.3;a._L=L;
      ctx.save();ctx.translate(x,y);ctx.scale(a.dir,1);drawAnimal(ctx,sp,L,a.p.color,a.ph,t,false,a.wob);ctx.restore();}
  }
  rest.forEach(p=>{const sp=SPC[p.kind],L=sp.L*p.sizeF*S*0.62;p._x=p.rx;p._y=p.ry-L*0.15;p._L=L;ctx.save();ctx.translate(p.rx,p.ry);drawAnimal(ctx,sp,L,p.color,0,t,true,h32(p.name,9)*6);ctx.restore();});
  const zt=t%3;ctx.globalAlpha=Math.max(0,1-zt/3);label(ctx,'z',W*0.3+zt*4,H*0.955-24*T-zt*8*T,'center',9*T);label(ctx,'z',W*0.15+zt*3,H*0.955-30*T-zt*7*T,'center',8*T);ctx.globalAlpha=1;
  label(ctx,SC.rest,W*0.6,H*0.955-2*T,'left',10*T);
  const s=VZ.sel;if(s&&s.ref)VZ.selRing(ctx,s.ref._x,s.ref._y,s.ref._L*0.55+6);
  requestAnimationFrame(frame);
}
cv.addEventListener('pointerdown',e=>{
  let best=null,bd=1e9;const X=e.clientX,Y=e.clientY;
  const test=(o,p)=>{if(o._x==null)return;const d=Math.hypot(X-o._x,Y-o._y);if(d<Math.max(o._L*0.5,14)&&d<bd){bd=d;best=[o,p];}};
  for(const a of an)test(a,a.p);for(const p of rest)test(p,p);
  if(best){const [o,p]=best;VZ.open({ref:o,title:p.name,kind:SPC[p.kind].label+VZ.sizeText(p),age:VZ.ageText(p,p.old?'Resting, ':''),host:p.host});}else VZ.close();
});
addEventListener('resize',resize);resize();requestAnimationFrame(frame);
});
