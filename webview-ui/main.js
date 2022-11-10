// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  setVSCodeMessageListener();

	setAddPurposeButtonStatus();

  const addPurposeButton = document.getElementById("add-purpose-button");
  addPurposeButton.addEventListener("click", addPurpose);
  const okPurposeButton = document.getElementById("save-purpose-button");
  okPurposeButton.addEventListener("click", okPurpose);
  const cancelPurposeButton = document.getElementById("cancel-purpose-button");
  cancelPurposeButton.addEventListener("click", okPurpose);

  const addRoleButton = document.getElementById("add-role-button");
  addRoleButton.addEventListener("click", addRole);
}

function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {
  });
}

function addPurpose() {
  const addPurposeBlock = document.getElementById("add-purpose");
	addPurposeBlock.classList.remove('hidden');

	hidePurposeButton();
}

function okPurpose() {

}

function cancelPurpose() {
  const addPurposeBlock = document.getElementById("add-purpose");
	addPurposeBlock.classList.add('hidden');

	showPurposeButton();
}

function setAddPurposeButtonStatus() {
  const purposesList = document.getElementById("purposes-list");
	if (purposesList.querySelectorAll('.parameter-list-item').length === 2) {
		hidePurposeButton();
	} else {
		showPurposeButton();
	}
}

function hidePurposeButton() {
	const addPurposeButton = document.getElementById("add-purpose-button");
	addPurposeButton.classList.add('hidden');
}

function showPurposeButton() {
	const addPurposeButton = document.getElementById("add-purpose-button");
	addPurposeButton.classList.remove('hidden');
}

function addRole() {
  const rolesList = document.getElementById("roles-list");
}
