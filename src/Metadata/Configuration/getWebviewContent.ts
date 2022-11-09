import { Webview, Uri } from "vscode";
import { getUri } from "../utilites/getUri";
import { Configuration } from "./configuration";

export function getWebviewContent(webview: Webview, extensionUri: Uri, configuration: Configuration) {
  const toolkitUri = getUri(webview, extensionUri, [
    "node_modules",
    "@vscode",
    "webview-ui-toolkit",
    "dist",
    "toolkit.js",
  ]);
  const styleUri = getUri(webview, extensionUri, ["webview-ui", "style.css"]);
  const mainUri = getUri(webview, extensionUri, ["webview-ui", "main.js"]);

	return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="module" src="${toolkitUri}"></script>
          <script type="module" src="${mainUri}"></script>
          <link rel="stylesheet" href="${styleUri}">
          <title></title>
      </head>
      <body id="webview-body">
        <header>
          <h1>${configuration.name}</h1>
          <div id="tags-container"></div>
				</header>
				<section id="configuration-form">
					<vscode-text-field id="name" value="${configuration.name}" placeholder="Enter a name" disabled>Имя</vscode-text-field>
					<vscode-text-field id="synonym" value="${configuration.synonym}" placeholder="Enter a synonym" disabled>Синоним</vscode-text-field>
					<vscode-text-field id="comment" value="${configuration.comment}" placeholder="Enter a comment" disabled>Комментарий</vscode-text-field>
					<vscode-text-field id="vendor" value="${configuration.vendor}" placeholder="Enter a vendor" disabled>Поставщик</vscode-text-field>
					<vscode-text-field id="version" value="${configuration.version}" placeholder="Enter a version" disabled>Версия</vscode-text-field>
				</section>
				</body>
			</html>
		`;
}