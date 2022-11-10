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
          <div class="header">Основные</div>
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
              <vscode-option value="Управляемое приложение"${(() => { if (configuration.defaultRunMode === 'ManagedApplication') { return ' selected'; }})()}>Управляемое приложение</vscode-option>
              <vscode-option value="Обычное приложение"${(() => { if (configuration.defaultRunMode !== 'ManagedApplication') { return ' selected'; }})()}>Обычное приложение</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Назначение использования</p>
            <p class="description">Указывает назначение использования прикладного решения (Мобильное устройство или Персональный компьютер). Свойство доступно только в том случае, если свойство Основной режим запуска установлено в значение Управляемое приложение.</p>
            <div class="parameter-list">
              ${configuration.usePurposes.map(up => `<div class="parameter-list-item"><div class="parameter-list-item-text">${up}</div></div>`).join('')}
            </div>
            <div>
              <vscode-button appearance="primary" class="parameter-button">Добавить назначение</vscode-button>
            </div>
          </div>
          <div class="parameter-container">
            <p class="label">Вариант встроенного языка</p>
            <p class="description">Выбирается основной язык программирования (русский или английский). Выбор определяет, на каком языке будут формироваться языковые конструкции в модулях (например, при использовании синтакс-помощника), формироваться имена свойств для объектов, создаваемых платформой в качестве результата работы, а также имена компонентов формы (элементы, команды, реквизиты, параметры) для форм создаваемых платформой (как в режиме «1С:Предприятие», так и в конфигураторе). Вне зависимости от значения свойства можно использовать как русский, так и английский вариант языковых конструкций. При смене значения свойства вариант написания введенных языковых конструкций не изменяется.</p>
            <vscode-dropdown position="below">
              <vscode-option${(() => { if (configuration.scriptVariant === 'Russian') { return ' selected'; }})()}>Русский</vscode-option>
              <vscode-option${(() => { if (configuration.scriptVariant !== 'Russian') { return ' selected'; }})()}>Английский</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Основные роли</p>
            <p class="description">Список ролей, которые будут использоваться в том случае, когда список пользователей прикладного решения пустой. В этом случае не выполняется авторизация доступа при начале работы системы и права доступа определяются набором ролей (<vscode-link href="#">подробнее о правиле сочетания ролей</vscode-link>), указанных в свойстве. При этом считается, что пользователь обладает административными правами вне зависимости от значения права Администрирование у всех ролей, указанных в качестве основных. Если не указаны основные роли конфигурации и список пользователей пуст, то пользователь работает без ограничения прав доступа. Роли задаются в ветви дерева конфигурации <vscode-link href="#">Общие – Роли</vscode-link>.</p>
            <div class="parameter-list">
              ${configuration.defaultRoles.map(dr => `<div class="parameter-list-item"><div class="parameter-list-item-text">${dr}</div></div>`).join('')}
            </div>
            <div>
              <vscode-button appearance="primary" class="parameter-button">Добавить роль</vscode-button>
            </div>
          </div>
          <div class="parameter-container">
            <vscode-link href="#">Модуль приложения</vscode-link>
            <vscode-link href="#">Модуль сеанса</vscode-link>
            <vscode-link href="#">Модуль внешнего соединения</vscode-link>
          </div>
          <div class="header">Представление</div>
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
          <div class="parameter-container">
            <p class="label">Авторские права</p>
            <p class="description">Информация об авторе конфигурации.</p>
            <vscode-text-field id="copyright" value="${configuration.copyright}" placeholder=""></vscode-text-field>
          </div>
          <div class="parameter-container">
            <p class="label">Адрес информации о поставщике</p>
            <p class="description">Ссылка на информацию о поставщике конфигурации. Указывается в свойстве Авторские права. Может задаваться как с префиксом схемы (http://), так и без него.</p>
            <vscode-text-field id="vendorInformationAddress" value="${configuration.vendorInformationAddress}" placeholder=""></vscode-text-field>
          </div>
          <div class="parameter-container">
            <p class="label">Адрес информации о конфигурации</p>
            <p class="description">Ссылка на информацию о конфигурации. Может задаваться как с префиксом схемы (http://), так и без него. В окне О программе отображается следующая информация: Синоним конфигурации, свойство Адрес информации о конфигурации, свойство Авторские права, свойство Адрес информации о поставщике конфигурации.</p>
            <vscode-text-field id="configurationInformationAddress" value="${configuration.configurationInformationAddress}" placeholder=""></vscode-text-field>
          </div>
          <div class="header">Разработка</div>
          <div class="parameter-container">
            <p class="label">Поставщик</p>
            <p class="description"></p>
            <vscode-text-field id="vendor" value="${configuration.vendor}" placeholder="Enter a vendor"></vscode-text-field>
          </div>
          <div class="parameter-container">
            <p class="label">Версия</p>
            <p class="description"></p>
            <vscode-text-field id="version" value="${configuration.version}" placeholder="Enter a version"></vscode-text-field>
          </div>
          <div class="parameter-container">
            <p class="label">Адрес каталога обновлений</p>
            <p class="description">Cодержит адрес ресурса, который может использоваться для обновления прикладного решения.</p>
            <vscode-text-field id="version" value="${configuration.updateCatalogAddress}" placeholder="Enter an update catalog address"></vscode-text-field>
          </div>
          <div class="header">Совместимость</div>
          <div class="parameter-container">
            <p class="label">Режим управления блокировкой данных</p>
            <p class="description">Вариант управления <vscode-link href="#">блокировкой данных в транзакции</vscode-link>.</p>
            <vscode-dropdown position="below">
              <vscode-option${(() => { if (configuration.dataLockControlMode === '') { return ' selected'; }})()}>Автоматический</vscode-option>
              <vscode-option${(() => { if (configuration.dataLockControlMode === 'Managed') { return ' selected'; }})()}>Управляемый</vscode-option>
              <vscode-option${(() => { if (configuration.dataLockControlMode === '') { return ' selected'; }})()}>Автоматический и управляемый</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Режим автонумерации объектов</p>
            <p class="description">Определяет, использовать повторно или нет автоматически полученные номера объектов, если они не записаны в базу данных.</p>
            <vscode-dropdown position="below">
              <vscode-option${(() => { if (configuration.objectAutonumerationMode !== 'NotAutoFree') { return ' selected'; }})()}>Освобождать автоматически</vscode-option>
              <vscode-option${(() => { if (configuration.objectAutonumerationMode === 'NotAutoFree') { return ' selected'; }})()}>Не освобождать автоматически</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Режим использования модальности</p>
            <p class="description">Указывает, можно в прикладном решении использовать методы, приводящие к открытию модальных окон или нельзя.</p>
            <vscode-dropdown position="below">
              <vscode-option${(() => { if (configuration.modalityUseMode === '') { return ' selected'; }})()}>Использовать</vscode-option>
              <vscode-option${(() => { if (configuration.modalityUseMode === 'UseWithWarnings') { return ' selected'; }})()}>Использовать с предупреждениями</vscode-option>
              <vscode-option${(() => { if (configuration.modalityUseMode === 'Use') { return ' selected'; }})()}>Не использовать</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Режим использования синхронных вызовов расширений платформы и внешних компонент</p>
            <p class="description">Свойство управляет возможностью использовать синхронные вызовы для работы с расширениями работы с файлами, криптографией и внешними компонентами. Если свойство установлено в значение Использовать, то на стороне клиента доступны синхронные методы работы с расширениями и внешними компонентами. В том случае, если свойство установлено в значение Не использовать, синхронные методы становятся недоступны в синтакс-помощнике, контекстной подсказке при редактировании модулей и расширенная проверка конфигурации выдает ошибки при обнаружении синхронных вызовов на стороне клиента. Вместо синхронных вызовов стоит использовать асинхронные аналоги.</p>
            <vscode-dropdown position="below">
              <vscode-option${(() => { if (configuration.synchronousPlatformExtensionAndAddInCallUseMode === '') { return ' selected'; }})()}>Использовать</vscode-option>
              <vscode-option${(() => { if (configuration.synchronousPlatformExtensionAndAddInCallUseMode === 'UseWithWarnings') { return ' selected'; }})()}>Использовать с предупреждениями</vscode-option>
              <vscode-option${(() => { if (configuration.synchronousPlatformExtensionAndAddInCallUseMode === 'Use') { return ' selected'; }})()}>Не использовать</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Режим совместимости интерфейса</p>
            <p class="description">Свойство управляет режимом интерфейса клиентского приложения</p>
            <vscode-dropdown position="below">
              <vscode-option${(() => { if (configuration.interfaceCompatibilityMode === '') { return ' selected'; }})()}>Такси</vscode-option>
              <vscode-option${(() => { if (configuration.interfaceCompatibilityMode === 'TaxiEnableVersion8_2') { return ' selected'; }})()}>Такси. Разрешить Версия 8.2</vscode-option>
              <vscode-option${(() => { if (configuration.interfaceCompatibilityMode === '') { return ' selected'; }})()}>Версия 8.2. Разрешить Такси</vscode-option>
              <vscode-option${(() => { if (configuration.interfaceCompatibilityMode === '') { return ' selected'; }})()}>Версия 8.2</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="parameter-container">
            <p class="label">Режим совместимости</p>
            <p class="description">Свойство управляет поведением механизмов, которое в новой версии системы изменено по сравнению с предыдущими версиями. <vscode-link href="#">Особенности работы системы в режиме совместимости с какой-либо версией</vscode-link></p>
            <vscode-dropdown position="below">
              <vscode-option${(() => { if (configuration.compatibilityMode === '') { return ' selected'; }})()}>Не использовать</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_20') { return ' selected'; }})()}>Версия 8.3.20</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_19') { return ' selected'; }})()}>Версия 8.3.19</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_18') { return ' selected'; }})()}>Версия 8.3.18</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_17') { return ' selected'; }})()}>Версия 8.3.17</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_16') { return ' selected'; }})()}>Версия 8.3.16</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_15') { return ' selected'; }})()}>Версия 8.3.15</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_14') { return ' selected'; }})()}>Версия 8.3.14</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_13') { return ' selected'; }})()}>Версия 8.3.13</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_12') { return ' selected'; }})()}>Версия 8.3.12</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_11') { return ' selected'; }})()}>Версия 8.3.11</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_10') { return ' selected'; }})()}>Версия 8.3.10</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_9') { return ' selected'; }})()}>Версия 8.3.9</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_8') { return ' selected'; }})()}>Версия 8.3.8</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_7') { return ' selected'; }})()}>Версия 8.3.7</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_6') { return ' selected'; }})()}>Версия 8.3.6</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_5') { return ' selected'; }})()}>Версия 8.3.5</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_4') { return ' selected'; }})()}>Версия 8.3.4</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_3') { return ' selected'; }})()}>Версия 8.3.3</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_2') { return ' selected'; }})()}>Версия 8.3.2</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_3_1') { return ' selected'; }})()}>Версия 8.3.1</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_2_16') { return ' selected'; }})()}>Версия 8.2.16</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_2_13') { return ' selected'; }})()}>Версия 8.2.13</vscode-option>
              <vscode-option${(() => { if (configuration.compatibilityMode === 'Version8_1') { return ' selected'; }})()}>Версия 8.1</vscode-option>
            </vscode-dropdown>
          </div>
        </section>
  		</body>
		</html>
		`;
}