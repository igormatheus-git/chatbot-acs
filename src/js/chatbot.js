/* Chatbot ACS · lógica. Carregue DEPOIS de config.js e knowledge-base.js. */
(function(){
const CONFIG=window.ACS_CONFIG,SYSTEM_PROMPT=window.ACS_SYSTEM_PROMPT,KB=window.ACS_KB,CHIPS=window.ACS_CHIPS;
/* Monta o HTML do widget */
const host=document.createElement("div");
host.innerHTML=`<div id="acs-bot">
  <div id="acs-panel" role="dialog" aria-label="Chat da Associação Conexão Social">
    <div class="acs-head">
      <div class="acs-avatar">ACS</div>
      <div><h3>Assistente Conexão Social</h3><p>Online · tire suas dúvidas</p></div>
      <button id="acs-close" aria-label="Fechar chat">×</button>
    </div>
    <div id="acs-msgs" aria-live="polite"></div>
    <div id="acs-chips"></div>
    <form id="acs-form">
      <input id="acs-input" type="text" placeholder="Digite sua pergunta…" autocomplete="off" aria-label="Sua mensagem">
      <button id="acs-send" type="submit" aria-label="Enviar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
      </button>
    </form>
    <div class="acs-foot">Assistente virtual com IA · pode cometer erros</div>
  </div>
  <button id="acs-fab" aria-label="Abrir chat">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>
  </button>
</div>`;
document.body.appendChild(host.firstElementChild);

/* ===== LÓGICA ===== */
const $=id=>document.getElementById(id);
const panel=$("acs-panel"),msgs=$("acs-msgs"),input=$("acs-input"),send=$("acs-send"),chips=$("acs-chips");
const history=[];
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

function contato(){
  const p=[];
  if(CONFIG.whatsapp)p.push("WhatsApp: "+CONFIG.whatsapp);
  if(CONFIG.email)p.push("E-mail: "+CONFIG.email);
  if(CONFIG.horario)p.push("Atendimento: "+CONFIG.horario);
  return p.length?"Você pode falar com a nossa equipe:\n"+p.join("\n"):
    "Para falar com a nossa equipe, visite a sede no Centro Tecnológico (Rua Projetada A, Salinas, Lagoa de Itaenga) ou use os canais oficiais no site somosconexaosocial.org.";
}
function localReply(q){
  const n=norm(q);
  for(const t of KB){ if(t.k.some(w=>n.includes(w))) return t.a==="__CONTATO__"?contato():t.a; }
  return "Não tenho essa informação com certeza, e prefiro não errar. 🙏 Fale com a nossa equipe para ter uma resposta confiável.\n\n"+contato();
}
async function reply(q){
  if(!CONFIG.apiUrl) return new Promise(r=>setTimeout(()=>r(localReply(q)),700));
  try{
    const res=await fetch(CONFIG.apiUrl,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({system:SYSTEM_PROMPT,messages:history.slice(-12)})});
    if(!res.ok) throw 0;
    const d=await res.json();
    return d.reply||localReply(q);
  }catch(e){ return localReply(q); }
}
function add(text,who){
  const d=document.createElement("div");
  d.className="acs-m "+who; d.textContent=text;
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight; return d;
}
async function ask(q){
  q=q.trim(); if(!q) return;
  chips.style.display="none";
  add(q,"user"); history.push({role:"user",content:q});
  input.value=""; send.disabled=true;
  const t=document.createElement("div");
  t.className="acs-m bot acs-typing"; t.innerHTML="<i></i><i></i><i></i>";
  msgs.appendChild(t); msgs.scrollTop=msgs.scrollHeight;
  const a=await reply(q);
  t.remove(); add(a,"bot"); history.push({role:"assistant",content:a});
  send.disabled=false; input.focus();
}
function open(){
  panel.classList.add("open");
  if(!msgs.children.length){
    add("Olá! Eu sou o assistente virtual da "+CONFIG.nome+". 💙 Como posso ajudar você hoje?","bot");
    CHIPS.forEach(c=>{const b=document.createElement("button");b.className="acs-chip";b.type="button";
      b.textContent=c;b.onclick=()=>ask(c);chips.appendChild(b);});
  }
  input.focus();
}
$("acs-fab").onclick=()=>panel.classList.contains("open")?panel.classList.remove("open"):open();
$("acs-close").onclick=()=>panel.classList.remove("open");
$("acs-form").onsubmit=e=>{e.preventDefault();ask(input.value);};
})();
