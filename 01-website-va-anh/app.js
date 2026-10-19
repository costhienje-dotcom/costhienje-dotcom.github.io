const grid=document.querySelector('#projects');
const status=document.querySelector('#load-status');
const modal=document.querySelector('#player');
const video=document.querySelector('#player-video');
let projects=[],current=-1,lastFocus=null;
const duration=n=>`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;
function render(){
 const categories=['Creative Edits','Ads & UGC','Educational','AI-Generated'];
 grid.replaceChildren(...categories.map((category,index)=>{
  const items=projects.filter(p=>p.category===category);
  const section=document.createElement('section');section.className='category-section';
  const headingId=`category-${index}`;section.setAttribute('aria-labelledby',headingId);
  const header=document.createElement('div');header.className='category-heading';
  const heading=document.createElement('h2');heading.id=headingId;heading.textContent=category;
  const count=document.createElement('span');count.className='category-count';count.textContent=`${items.length} videos`;
  header.append(heading,count);
  const cards=document.createElement('div');cards.className='project-grid';
  cards.append(...items.map((p,i)=>{
  const article=document.createElement('article');article.className='project-card';article.style.animationDelay=`${Math.min(i,7)*35}ms`;
  const button=document.createElement('button');button.className='project-cover';button.dataset.project=p.id;button.setAttribute('aria-label',`Play ${p.title}, ${duration(p.duration)}`);
  const img=document.createElement('img');img.src=p.poster;img.alt=`${p.title} — video still`;img.loading='lazy';img.width=540;img.height=840;
  const play=document.createElement('span');play.className='play';play.textContent='▶';play.setAttribute('aria-hidden','true');
  const time=document.createElement('span');time.className='duration';time.textContent=duration(p.duration);
  button.append(img,play,time);const title=document.createElement('h3');title.textContent=p.title;article.append(button,title);return article;
  }));
  section.append(header,cards);return section;
 }));
}
function play(id){
 const p=projects.find(p=>p.id===id);if(!p)return;
 current=projects.indexOf(p);
 if(!modal.open){lastFocus=document.activeElement;modal.showModal();document.body.style.overflow='hidden';}
 document.querySelector('#player-title').textContent=p.title;
 document.querySelector('#player-category').textContent=p.category;
 document.querySelector('#player-position').textContent=`${current+1} / ${projects.length} · ${duration(p.duration)}`;
 document.querySelector('#player-error').hidden=true;
 document.querySelector('#direct-video').href=p.video;
 document.querySelector('#previous').disabled=current===0;document.querySelector('#next').disabled=current===projects.length-1;
 video.poster=p.poster;video.src=p.video;video.load();video.play().catch(()=>{});
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-project]');if(button)play(button.dataset.project)});
document.querySelector('.close').addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
modal.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load();document.body.style.overflow='';lastFocus?.focus()});
document.querySelector('#previous').addEventListener('click',()=>{if(current>0)play(projects[current-1].id)});
document.querySelector('#next').addEventListener('click',()=>{if(current<projects.length-1)play(projects[current+1].id)});
video.addEventListener('error',()=>{if(video.getAttribute('src'))document.querySelector('#player-error').hidden=false});
fetch('projects.json').then(r=>{if(!r.ok)throw new Error('Project data unavailable');return r.json()}).then(data=>{projects=data;render();status.hidden=true}).catch(()=>{status.textContent='The collection could not load. Please refresh the page to try again.'});
