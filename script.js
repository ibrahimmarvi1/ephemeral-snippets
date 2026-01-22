/* * Project: Ephemeral Snippets
 * Author: [Ibrahim Marvi]
 * URL: https://imnichecode.github.io/ephemeral-snippets/
 * License: MIT
 */

const saveBtn = document.getElementById('saveBtn');
const snippetInput = document.getElementById('snippetInput');
const expirySelect = document.getElementById('expirySelect');
const snippetList = document.getElementById('snippetList');

renderSnippets();
setInterval(renderSnippets, 1000);

saveBtn.addEventListener('click', () => {
    const content = snippetInput.innerHTML.trim();
    if (!content || content === '<br>') return;

    const snippets = JSON.parse(localStorage.getItem('snippets') || '[]');
    const newSnippet = {
        id: Date.now(),
        content: content,
        expiry: Date.now() + parseInt(expirySelect.value)
    };

    snippets.push(newSnippet);
    localStorage.setItem('snippets', JSON.stringify(snippets));
    snippetInput.innerHTML = ''; 
    renderSnippets();
});

// The New Copy Function
async function copySnippet(id) {
    const cardContent = document.querySelector(`.content-${id}`);
    
    try {
        // This handles copying both text and images as HTML
        const type = "text/html";
        const blob = new Blob([cardContent.innerHTML], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        await navigator.clipboard.write(data);
        
        // Brief visual feedback
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.color = "#4ade80";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.color = "#3b82f6";
        }, 1000);
    } catch (err) {
        console.error("Failed to copy: ", err);
    }
}

function deleteSnippet(id) {
    let snippets = JSON.parse(localStorage.getItem('snippets') || '[]');
    const updatedSnippets = snippets.filter(s => s.id !== id);
    localStorage.setItem('snippets', JSON.stringify(updatedSnippets));
    renderSnippets();
}

function renderSnippets() {
    let snippets = JSON.parse(localStorage.getItem('snippets') || '[]');
    const now = Date.now();
    const activeSnippets = snippets.filter(s => s.expiry > now);
    
    if (activeSnippets.length !== snippets.length) {
        localStorage.setItem('snippets', JSON.stringify(activeSnippets));
    }

    snippetList.innerHTML = activeSnippets.map(s => {
        const secondsLeft = Math.round((s.expiry - now) / 1000);
        return `
            <div class="snippet-card">
                <div class="card-header">
                    <span class="time-left">Expires: ${secondsLeft}s</span>
                    <div class="card-actions">
                        <button class="copy-btn" onclick="copySnippet(${s.id})">Copy</button>
                        <button class="delete-btn" onclick="deleteSnippet(${s.id})">Delete</button>
                    </div>
                </div>
                <div class="content content-${s.id}">${s.content}</div>
            </div>
        `;
    }).join('');
}