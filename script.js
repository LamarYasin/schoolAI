document.addEventListener("DOMContentLoaded", () => {
  // ---------- Slider ----------
  const container = document.querySelector('.slides-wrapper');
  const slides = document.querySelectorAll('.slide');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');
  let currentIndex = 0;

  function showSlide(index){
    if(index < 0) index = slides.length-1;
    if(index >= slides.length) index = 0;
    container.style.transform = `translateX(-${index*100}%)`;
    currentIndex = index;
  }
  nextBtn.addEventListener('click', ()=>showSlide(currentIndex+1));
  prevBtn.addEventListener('click', ()=>showSlide(currentIndex-1));

  // ---------- Mood Tracker ----------
  document.querySelectorAll('.mood-container').forEach(container=>{
    const subject = container.dataset.subject;
    const aiMessage = document.getElementById(`aiMessage-${subject}`);
    container.querySelectorAll('.mood-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        container.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const mood = btn.dataset.mood;
        fetch('/ai_suggestion',{
          method:'POST',
          headers:{'Content-Type':'application/x-www-form-urlencoded'},
          body:`mood=${encodeURIComponent(mood)}`
        }).then(res=>res.json())
          .then(data=>{ aiMessage.textContent = data.message; });
      });
    });
  });

  // ---------- Tasks ----------
  document.querySelectorAll('.remove-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const li = e.target.closest('li');
      const subject = e.target.closest('.slide').querySelector('h2').innerText;
      const taskText = btn.dataset.task;
      fetch('/remove_task',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({subject, task:taskText})
      }).then(()=>li.remove());
    });
  });

  document.querySelectorAll('.slide ul li').forEach(li=>{
    li.addEventListener('click', e=>{
      if(e.target.tagName==='BUTTON') return;
      const subject = li.closest('.slide').querySelector('h2').innerText;
      const taskText = li.innerText.replace('✔️','').trim();
      li.classList.toggle('done');
      fetch('/toggle_task',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({subject, task:taskText})
      });
    });
  });

  // ---------- Timer ----------
  document.querySelectorAll('.timer-container').forEach(container=>{
    const display = container.querySelector('.timer');
    const startBtn = container.querySelector('.start-btn');
    const pauseBtn = container.querySelector('.pause-btn');
    const resetBtn = container.querySelector('.reset-btn');
    let totalSeconds = 25*60;
    let interval;

    function updateDisplay(){ 
      let m=Math.floor(totalSeconds/60); 
      let s=totalSeconds%60;
      display.textContent=`${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }

    startBtn.addEventListener('click', ()=>{
      if(!interval){
        interval=setInterval(()=>{
          if(totalSeconds>0){ totalSeconds--; updateDisplay();}
          else{ clearInterval(interval); interval=null; alert('Time is up!'); }
        },1000);
      }
    });
    pauseBtn.addEventListener('click', ()=>{
      clearInterval(interval); interval=null;
    });
    resetBtn.addEventListener('click', ()=>{
      clearInterval(interval); interval=null;
      totalSeconds=25*60; updateDisplay();
    });

    updateDisplay();
  });
});
