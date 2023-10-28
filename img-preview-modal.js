const injectModal = () =>{
  const modalHTML = `<div id="img-preview-modal">
  <img id="img-preview-modal-img" data-scale="1" draggable="false" />
  <button id="reset">100%</button>
  <select name="rendering-algorithm" id="rendering-algorithm">
    <option value="auto">スムーズ(自動)</option>
    <option value="smooth">スムーズ</option>
    <option value="high-quality">高品質</option>
    <option value="crisp-edges">鮮明</option>
    <option value="pixelated">ニアレストネイバー</option>
  </select>
</div>`
  document.body.insertAdjacentHTML('beforeend', modalHTML)
  const modalCSS = `#img-preview-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.8);
  z-index: 100;
}
#img-preview-modal img {
  position: absolute;
  transform-origin: 0px 0px;
  transform: translate(0px, 0px) scale(1);
  max-height: 100%;
  max-width: 100%;
  z-index: 110;
  cursor: grab;
}
#img-preview-modal button, #img-preview-modal select {
  position: relative;
  z-index: 120;
}`
  const styleElem = document.createElement('style')
  styleElem.innerText = modalCSS
  document.head.appendChild(styleElem)
}

const initImgPreviewModal = () => {
  injectModal()
  const imgElements = document.getElementsByClassName('preview-target')
  const modal = document.getElementById('img-preview-modal')
  const modalImg = document.getElementById('img-preview-modal-img')
  const resetBtn = document.getElementById('reset')
  const renderingAlgorithmSelect = document.getElementById('rendering-algorithm')
  let modalImgScale = 1
  const displacement = {x:0,y:0}
  let holding = false
  const dragStart = {x:0,y:0}

  // モーダル画像に移動とスケールを適用する関数
  const applyTransform = () => {
    modalImg.style.transform = `translate(${displacement.x}px, ${displacement.y}px) scale(${modalImgScale})`;
  }

  // preview-target というクラスを付与した画像をクリックしたときにそのsrcをモーダルのimg.srcに送るクリックイベントを追加
  document.body.addEventListener('click', (event)=>{
    const target = event.target
    if(target.classList.contains('preview-target')){
      modalImg.src = target.src
      modal.style.display = 'block'
      displacement.x = (window.innerWidth - parseFloat(getComputedStyle(modalImg).width))/2
      displacement.y = (window.innerHeight - parseFloat(getComputedStyle(modalImg).height))/2
      document.body.style.overflow = 'hidden'
      applyTransform()
    }
  })

  // モーダルを閉じる
  modal.addEventListener('click', (event)=>{
    if(event.target === modal){
      modalImgScale = 1
      applyTransform()
      modal.style.display = 'none'
      holding = false
      document.body.style.overflow = 'auto'
    }
  })

  // モーダル画像のクリック時
  modalImg.addEventListener('mousedown', (event)=>{
    event.preventDefault()
    dragStart.x = event.clientX - displacement.x
    dragStart.y = event.clientY - displacement.y
    holding = true
  })

  // クリックをやめたとき
  modalImg.addEventListener('mouseup', (event)=>{
    event.preventDefault()
    holding = false
  })

  // ドラッグしているとき(マウスを動かしているときに条件をつけてドラッグを判断)
  modalImg.addEventListener('mousemove', (event)=>{
    event.preventDefault()
    if(!holding){ return }
    displacement.x = event.clientX - dragStart.x
    displacement.y = event.clientY - dragStart.y
    applyTransform()
  })

  // スクロールアップでモーダル画像ズームイン
  // スクロールダウンでモーダル画像ズームアウト
  modalImg.addEventListener('wheel', (event)=>{
    const preZoomCursorPosX = (event.clientX - displacement.x) / modalImgScale
    const preZoomCursorPosY = (event.clientY - displacement.y) / modalImgScale
    if(event.deltaY > 0){
      modalImgScale /= 1.1
    } else if(event.deltaY < 0){
      modalImgScale *= 1.1
    }
    displacement.x = event.clientX - preZoomCursorPosX * modalImgScale
    displacement.y = event.clientY - preZoomCursorPosY * modalImgScale
    applyTransform()
  })

  // 100%ボタンの動作
  resetBtn.addEventListener('click', ()=>{
    modalImgScale = 1 / window.devicePixelRatio
    displacement.x = (window.innerWidth - parseFloat(getComputedStyle(modalImg).width))/2
    displacement.y = (window.innerHeight - parseFloat(getComputedStyle(modalImg).height))/2
    applyTransform()
  })

  // // 画像レンダリングアルゴリズム変更処理
  renderingAlgorithmSelect.addEventListener('change', (event)=>{
    modalImg.style.imageRendering = event.target.value
  })
}

initImgPreviewModal()
