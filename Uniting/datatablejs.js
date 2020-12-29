// $(document).ready(function () {
//
//   $('.first-button').on('click', function () {
//
//     $('.animated-icon1').toggleClass('open');
//   });
//   $('.second-button').on('click', function () {
//
//     $('.animated-icon2').toggleClass('open');
//   });
//   $('.third-button').on('click', function () {
//
//     $('.animated-icon3').toggleClass('open');
//   });
// });
//
// const indicator = document.querySelector('.nav-indicator');
// const items = document.querySelectorAll('.nav-item');
//
// function handleIndicator(el) {
//   items.forEach(item => {
//     item.classList.remove('is-active');
//     item.removeAttribute('style');
//   });
//
//   indicator.style.width = `${el.offsetWidth}px`;
//   indicator.style.left = `${el.offsetLeft}px`;
//   indicator.style.backgroundColor = el.getAttribute('active-color');
//
//   el.classList.add('is-active');
//   el.style.color = el.getAttribute('active-color');
// }
//
//
// items.forEach((item, index) => {
//   item.addEventListener('click', (e) => { handleIndicator(e.target)});
//   item.classList.contains('is-active') && handleIndicator(item);
// });
//
// //datatable click 함수
// let highlight;
//
// function addClass(target) {
//     target.classList.add('selector-item--active');
// }
//
// function selectItem(event) {
//   const target = event.target;
//   const items = document.querySelectorAll('.selector-item');
//   const parent = document.querySelector('.selector');
//   const targetRect = target.getBoundingClientRect();
//   const parentRect = parent.getBoundingClientRect();
//
//   items.forEach(el => el.classList.remove('selector-item--active'));
//
//   highlight.style.left = `${targetRect.left - parentRect.left}px`;
//
//   addClass(target);
//   setHighlightWidth(target);
// }
//
// function setHighlightWidth(target = null) {
//   const itemTarget = target || document.querySelector('.selector-item');
//   const rect = itemTarget.getBoundingClientRect();
//
//   addClass(itemTarget)
//
//   highlight = document.querySelector('.highlight');
//   highlight.style.width = `${rect.width}px`;
// }
//
// setHighlightWidth();
