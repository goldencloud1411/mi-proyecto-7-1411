// Este archivo permite que al hacer clic en el icono de la extensión se abra el SidePanel
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));