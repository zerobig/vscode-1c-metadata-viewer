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
				</header>
        <section class="column-container">
          <div class="parameter-container">
            <p class="label">Имя</p>
            <p class="description">Имя конфигурации. Имя используется для обращения из встроенного языка. Оно позволяет отличить одну конфигурацию от другой при выполнении административных действий с разными конфигурациями. Имя должно состоять из одного слова, начинаться с буквы и не содержать специальных символов кроме "_". Длина имени не может превышать 80 символов.</p>
            <vscode-text-field id="name" value="${configuration.name}" placeholder="Enter a name"></vscode-text-field>
          </div>
          <div class="parameter-container">
            <p class="label">Синоним</p>
            <p class="description">Синоним конфигурации. Синоним содержит название, которое будет показано пользователям. Синоним конфигурации отображается в левой части заголовка главного окна.</p>
            <vscode-text-field id="synonym" value="${configuration.synonym}" placeholder="Enter a synonym"></vscode-text-field>
          </div>
          <div class="parameter-container">
            <p class="label">Комментарий</p>
            <p class="description">Комментарий к конфигурации. Содержит произвольный комментарий для разработчиков.</p>
            <vscode-text-field id="comment" value="${configuration.comment}" placeholder="Enter a comment"></vscode-text-field>
          </div>
          <div class="parameter-container">
            <p class="label">Основной режим запуска</p>
            <p class="description">Выбирается режим запуска системы по умолчанию (Управляемое приложение или Обычное приложение). Для новой конфигурации устанавливается режим запуска Управляемое приложение. Также режим запуска можно <vscode-link href="#">изменять для пользователя системы</vscode-link>. Данное свойство нельзя изменить, если свойство Режим совместимости установлено в значение Версия 8.1.</p>
            <vscode-dropdown position="below">
              <vscode-option>Управляемое приложение</vscode-option>
              <vscode-option>Обычное приложение</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Назначение использования</p>
            <p class="description">Указывает назначение использования прикладного решения (Мобильное устройство или Персональный компьютер). Свойство доступно только в том случае, если свойство Основной режим запуска установлено в значение Управляемое приложение.</p>
            <div class="parameter-list">
              <div class="parameter-list-item">Приложение для платформы</div>
            </div>
            <div>
              <vscode-button appearance="primary">Добавить назначение</vscode-button>
            </div>
          </div>
          <div class="parameter-container">
            <p class="label">Вариант встроенного языка</p>
            <p class="description">Выбирается основной язык программирования (русский или английский). Выбор определяет, на каком языке будут формироваться языковые конструкции в модулях (например, при использовании синтакс-помощника), формироваться имена свойств для объектов, создаваемых платформой в качестве результата работы, а также имена компонентов формы (элементы, команды, реквизиты, параметры) для форм создаваемых платформой (как в режиме «1С:Предприятие», так и в конфигураторе). Вне зависимости от значения свойства можно использовать как русский, так и английский вариант языковых конструкций. При смене значения свойства вариант написания введенных языковых конструкций не изменяется.</p>
            <vscode-dropdown position="below">
              <vscode-option>Русский</vscode-option>
              <vscode-option>Английский</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Основные роли</p>
            <p class="description">Список ролей, которые будут использоваться в том случае, когда список пользователей прикладного решения пустой. В этом случае не выполняется авторизация доступа при начале работы системы и права доступа определяются набором ролей (<vscode-link href="#">подробнее о правиле сочетания ролей</vscode-link>), указанных в свойстве. При этом считается, что пользователь обладает административными правами вне зависимости от значения права Администрирование у всех ролей, указанных в качестве основных. Если не указаны основные роли конфигурации и список пользователей пуст, то пользователь работает без ограничения прав доступа. Роли задаются в ветви дерева конфигурации <vscode-link href="#">Общие – Роли</vscode-link>.</p>
            <div class="parameter-list">
              <div class="parameter-list-item">Роль.ПолныеПрава</div>
              <div class="parameter-list-item">Роль.АдминистраторСистемы</div>
              <div class="parameter-list-item">Роль.ИнтерактивноеОткрытиеВнешнихОтчетовИОбработок</div>
            </div>
            <div>
              <vscode-button appearance="primary">Добавить роль</vscode-button>
            </div>
          </div>
          <vscode-link href="#">Модуль приложения</vscode-link>
          <vscode-link href="#">Модуль сеанса</vscode-link>
          <vscode-link href="#">Модуль внешнего соединения</vscode-link>
          <div class="parameter-container">
            <p class="label">Краткая информация</p>
            <p class="description">Краткая информация о конфигурации.</p>
            <vscode-text-field id="briefInformation" value="${configuration.briefInformation}" placeholder=""></vscode-text-field>
          </div>
          <div class="parameter-container">
            <p class="label">Подробная информация</p>
            <p class="description">Подробная информация о конфигурации (допускается использование многострочного текста).</p>
            <vscode-text-area id="detailedInformation" value="${configuration.detailedInformation}" placeholder=""></vscode-text-area>
          </div>
          <vscode-text-field id="copyright" value="${configuration.copyright}" placeholder="">Авторские права</vscode-text-field>
          <vscode-text-field id="vendorInformationAddress" value="${configuration.vendorInformationAddress}" placeholder="">Адрес информации о поставщике</vscode-text-field>
          <vscode-text-field id="configurationInformationAddress" value="${configuration.configurationInformationAddress}" placeholder="">Адрес информации о конфигурации</vscode-text-field>
          <vscode-text-field id="vendor" value="${configuration.vendor}" placeholder="Enter a vendor">Поставщик</vscode-text-field>
          <vscode-text-field id="version" value="${configuration.version}" placeholder="Enter a version">Версия</vscode-text-field>
          <p class="label">Режим управления блокировкой данных</p>
          <vscode-dropdown position="below">
            <vscode-option>Управляемый</vscode-option>
            <vscode-option>0</vscode-option>
          </vscode-dropdown>
          <p class="label">Режим автонумерации объектов</p>
          <vscode-dropdown position="below">
            <vscode-option>Не освобождать автоматически</vscode-option>
            <vscode-option>1</vscode-option>
          </vscode-dropdown>
          <p class="label">Режим использования модальности</p>
          <vscode-dropdown position="below">
            <vscode-option>Использовать с предупреждениями</vscode-option>
            <vscode-option>2</vscode-option>
          </vscode-dropdown>
          <p class="label">Режим использования синхронных вызовов расширений платформы и внешних компонент</p>
          <vscode-dropdown position="below">
            <vscode-option>Использовать</vscode-option>
            <vscode-option>3</vscode-option>
          </vscode-dropdown>
          <p class="label">Режим совместимости интерфейса</p>
          <vscode-dropdown position="below">
            <vscode-option>Такси. Разрешить Версия 8.2</vscode-option>
            <vscode-option>4</vscode-option>
          </vscode-dropdown>
          <p class="label">Режим совместимости</p>
          <vscode-dropdown position="below">
            <vscode-option>Версия 8.3.12</vscode-option>
            <vscode-option>5</vscode-option>
          </vscode-dropdown>
        </section>
  		</body>
		</html>
		`;
}