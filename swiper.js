/**
 * 
 * @param {function} func 
 * @param {number} ms 
 * @param  {...any} args 
 * @returns 
 */
function throttle(func,ms,...args){
  let startTime=0
  return function(){
    if(Date.now()-startTime>ms){
      func.apply(this,args)
      startTime=Date.now()
    }
  }
}


class SwiperPlus{
  #currentMarginLeft=0
  #currentItemIndex=0
  #globalTimer=null
  #returnStart=false
  #animationId=null
  constructor(el,{
    delay=2000,
    autoPlay=true,
    showLeftAndRightBtn=true,
    showBottomBtn=true
  }={}){
    this.el=el
    this.delay=delay
    this.autoPlay=autoPlay
    this.showLeftAndRightBtn=showLeftAndRightBtn
    this.showBottomBtn=showBottomBtn
    this._init()
  }
  _init(){
    this._initData()
    this._initSwiper()
    this._initLeftAndRightBtn()
    this._initBottomBtn()
    this._initEvents()
    this._startSlide()
  }
  _initData(){
    this.el=document.querySelector(this.el)
    this.swiperWrap=this.el.firstElementChild
    this.firstItem=this.swiperWrap.firstElementChild
    this.wrapWidth=this.swiperWrap.offsetWidth
    this.itemWidth=this.firstItem.offsetWidth
    this.itemNumber=this.swiperWrap.children.length
  }
  _initSwiper(){
    let copyItem = this.firstItem.cloneNode(true)
    this.swiperWrap.style.width=this.wrapWidth+this.itemWidth+'px'
    this.swiperWrap.append(copyItem)
  }
  _initLeftAndRightBtn(){
    function createBtn(content,...className){
      let btn=document.createElement('div')
      btn.textContent=content
      btn.hidden=true
      btn.classList.add(...className)
      return btn
    }
    let leftBtn = createBtn('<','leftBtn')
    let rightBtn=createBtn('>','rightBtn')
    this.rightBtn = rightBtn
    this.el.append(leftBtn,rightBtn)
    if(this.showLeftAndRightBtn===true){
      leftBtn.hidden=false
      rightBtn.hidden=false
    }
  }
  _initBottomBtn(){
    if(this.showBottomBtn===true){
      let oracleBox = document.createElement('ul')
      oracleBox.classList.add('oracleBox')
      this.oracleBox = oracleBox
      for(let i = 0;i<this.itemNumber;i++){
        let oracle = document.createElement('li')
        oracle.classList.add('oracle')
        oracle.setAttribute('data-index',i)
        oracleBox.append(oracle)
      }
      oracleBox.children[this.#currentItemIndex].classList.add('activeOracle')
      this.el.append(oracleBox)
    }
  }
  _initEvents(){
    async function slideOneItem(index,callback){
      let target = -this.itemWidth*index
      let res = await this.scrollItem(this.swiperWrap,target)
      if(res){
        let activeOracle = this.oracleBox?.children[this.#currentItemIndex]
        activeOracle?.classList.remove('activeOracle')
        if(callback) callback()
        if(this.#returnStart) return this.#returnStart=false;
        this.#currentItemIndex = index
        this.oracleBox?.children[this.#currentItemIndex].classList.add('activeOracle')
        if(!this.#globalTimer) this._startSlide()
      }
    }
    function clearTimer(){
      clearInterval(this.#globalTimer)
      this.#globalTimer = null
    }
    function listener(){
      let e = event || window.event
      const targetClass = e.target.classList
      if(targetClass.contains('leftBtn')){
        clearTimer.call(this)
        let index = this.#currentItemIndex-1
        if(index===-1){
          index=this.itemNumber-1
          this.#currentMarginLeft=-this.wrapWidth
          this.swiperWrap.style.marginLeft=-this.wrapWidth+'px'
        }
        slideOneItem.call(this,index)
        this._startSlide
      }else if(targetClass.contains('rightBtn')){
        if(e.isTrusted) clearTimer.call(this)
        let index = this.#currentItemIndex+1
        slideOneItem.call(this,index,()=>{
          if(index===this.itemNumber){
            this.#currentItemIndex = 0
            this.#currentMarginLeft=0
            this.swiperWrap.style.marginLeft='0px'
            let newActiveOracle= this.oracleBox?.children[this.#currentItemIndex]
            newActiveOracle?.classList.add('activeOracle')
            this.#returnStart = true
          }
        })
      }else if(targetClass.contains('oracle')){
        clearTimer.call(this)
        let index = +e.target.dataset.index
        if(index === this.#currentItemIndex) return;
        slideOneItem.call(this,index)
      }
    }
    this.el.onmousedown = ()=>false
    this.el.addEventListener('click',throttle(listener,700).bind(this))
  }
  _startSlide(){
    if(this.autoPlay===true){
      this.#globalTimer = setInterval(()=>this.rightBtn.click(),this.delay)
    }
  }
  scrollItem(el,target){
    cancelAnimationFrame(this.#animationId)
    this.#animationId=null
    return new Promise(resolve=>{
      animate.call(this)
      function animate(){
        let step = (target-this.#currentMarginLeft)*0.1
        step = step<0?Math.floor(step):Math.ceil(step)
        this.#currentMarginLeft+=step
        el.style.marginLeft=this.#currentMarginLeft+'px'
        if(this.#currentMarginLeft!==target){
          this.#animationId = requestAnimationFrame(animate.bind(this))
        }else{
          cancelAnimationFrame(this.#animationId)
          this.#animationId=null
          resolve(true)
        }
      }
    })
  }
}