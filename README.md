![logo-long](https://github.com/bayselonarrend/vscode-1c-metadata-viewer/assets/105596284/31fa7640-7d7d-4b6c-8099-c11f3a1e6c75)

# VS:1CMV

VS:1CMV - это расширение для вывода дерева метаданных и открытия модулей конфигурациии 1С:Предприятие в Visual Studio Code. Установить его можно [со страницы расширения Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Zerobig.vscode-1c-metadata-viewer) через браузер или встроенную панель расширений VS Code
<br><br>

> [!WARNING]  
> Проект находится на стадии активного развития. Вы можете внести свой вклад, поучаствова в его разработке или создав Issue с багрепортами или предложениями. Ознакомится с Roadmap по планам работ вы можете ниже:<br>
> [Дальнейшие планы (roadmap)](#что-ещё-планируется-roadmap)

<br>

## Возможности расширения

<br>
<img src="https://github.com/bayselonarrend/vscode-1c-metadata-viewer/assets/105596284/1a628629-8f22-445f-aad4-a062e75fe9ba" align=right width=310>

* Расширение ищет в открытой папке пары файлов `ConfigDumpInfo.xml` и `Configuration.xml` (для XML формата) или файл `Configuration.mdo` (для EDT формата) выгруженных конфигураций 1С и для каждого варианта строит дерево метаданных в панели VS Code. Для задания глубины просмотра подкаталогов существует настройка "Search Depth". По умолчанию значение настройки равно трём. **Особенно важной эта настройка становится для формата EDT [см.статью в wiki](https://github.com/zerobig/vscode-1c-metadata-viewer/wiki/%D0%9D%D0%B5-%D0%BD%D0%B0%D1%85%D0%BE%D0%B4%D0%B8%D1%82-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82-%D0%B2-%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%82%D0%B5-EDT)**
* Открывает текстовые модули 1С (*.bsl) через контекстное меню у соответствующих элементов.
* У метаданных для которых есть возможность создания предопределенных элементов можно открыть панель существующих в конфигурации элементов.
* Открывает формы объектов и табличные документы в режиме просмотра.
* Через контекстное меню подсистемы можно отфильтровать объекты относящиеся только к выбранной подсистеме. Снимается фильтр так же через контекстное меню на любой подсистеме.

<br><br>

## Метаданные и модули


### Метаданные:

Расширени позволяет работать со следующими видами метаданных 1С

<table>
  <tr>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/subsystem.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/subsystem.svg#gh-dark-mode-only" width=28 align=left>
      Подсистемы
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/sessionParameter.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/sessionParameter.svg#gh-dark-mode-only" width=28 align=left>
      Парам. сеанса
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/role.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/role.svg#gh-dark-mode-only" width=28 align=left>
      Роли
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/wsLink.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/wsLink.svg#gh-dark-mode-only" width=28 align=left>
      WS-ссылки
    </td>
  </tr>

  <tr>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/eventSubscription.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/eventSubscription.svg#gh-dark-mode-only" width=28 align=left>
      Подписки на события
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/scheduledJob.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/scheduledJob.svg#gh-dark-mode-only" width=28 align=left>
      Регламентные задания
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/form.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/form.svg#gh-dark-mode-only" width=28 align=left>
      Общие формы
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/ws.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/ws.svg#gh-dark-mode-only" width=28 align=left>
      Web-сервисы
    </td>

  </tr>

  <tr>
    <td>  
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/common.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/common.svg#gh-dark-mode-only" width=28 align=left>
      Общие реквизиты
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/style.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/style.svg#gh-dark-mode-only" width=28 align=left>
      Стили
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/constant.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/constant.svg#gh-dark-mode-only" width=28 align=left>
      Константы
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/catalog.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/catalog.svg#gh-dark-mode-only" width=28 align=left>
      Справочники
    </td>
 
  </tr>

  <tr>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/documentJournal.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/documentJournal.svg#gh-dark-mode-only" width=28 align=left>
      Журналы документов
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/enum.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/enum.svg#gh-dark-mode-only" width=28 align=left>
      Перечисления
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/externalDataSource.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/externalDataSource.svg#gh-dark-mode-only" width=28 align=left>
      Внешние источники данных
    </td>  
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/report.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/report.svg#gh-dark-mode-only" width=28 align=left>
      Отчеты
    </td>
  </tr>

  <tr>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/chartsOfCharacteristicType.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/chartsOfCharacteristicType.svg#gh-dark-mode-only" width=28 align=left>
      ПВХ
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/chartsOfAccount.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/chartsOfAccount.svg#gh-dark-mode-only" width=28 align=left>
      Планы счетов
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/chartsOfCalculationType.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/chartsOfCalculationType.svg#gh-dark-mode-only" width=28 align=left>
      Планы видов расчета
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/informationRegister.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/informationRegister.svg#gh-dark-mode-only" width=28 align=left>
      Регистры сведений
    </td>

   </tr>
   <tr>
     <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/accountingRegister.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/accountingRegister.svg#gh-dark-mode-only" width=28 align=left>
      Регистры бухгалтерии
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/calculationRegister.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/calculationRegister.svg#gh-dark-mode-only" width=28 align=left>
      Регистры расчета
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/businessProcess.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/businessProcess.svg#gh-dark-mode-only" width=28 align=left>
      Бизнес-процессы
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/task.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/task.svg#gh-dark-mode-only" width=28 align=left>
      Задачи
    </td>
   </tr>
   <tr>
     <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/exchangePlan.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/exchangePlan.svg#gh-dark-mode-only" width=28 align=left>
      Планы обмена
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/http.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/http.svg#gh-dark-mode-only" width=28 align=left>
      Http-сервисы
    </td>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/document.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/document.svg#gh-dark-mode-only" width=28 align=left>
      Документы
    </td> 
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/dataProcessor.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/dataProcessor.svg#gh-dark-mode-only" width=28 align=left>
      Обработки
    </td>
   </tr>
   <tr>
    <td>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/light/accumulationRegister.svg#gh-light-mode-only" width=28 align=left>
      <img src="https://raw.githubusercontent.com/zerobig/vscode-1c-metadata-viewer/main/resources/dark/accumulationRegister.svg#gh-dark-mode-only" width=28 align=left>
      Регистры накопления
    </td>
   </tr>
</table>


### Модули:

Поддерживается работа со следующими модулями:

<details>
  <summary>Развернуть</summary>
  <br>

  * Модуль приложения
  * Модуль сеанса
  * Общий модуль
  * Модуль объекта
  * Модуль менеджера
  * Модуль формы
  * Модуль команды
  * Модуль записи
  * Модуль менеджера значения (для констант)

</details>

<br>

## Что ещё планируется (roadmap)

- [x] Работа с форматом выгрузки EDT - [#3](https://github.com/zerobig/vscode-1c-metadata-viewer/issues/3)
- [ ] Возможность чтения метаданных без файла ConfigDumpInfo.xml
- Предпросмотр форм:
  - [ ] Поле radio button
  - [ ] Поле декорации (картинка)
  - [ ] Рефакторинг поля ввода - кнопки, обязательность заполнения и т.д.
  - [ ] Наполнение командных панелей форм и табличных частей
  - [ ] Просмотр свойств элементов форм
  - [ ] Возможность просмотра событий привязанных к элементам форм и переход на процедуры модуля формы
  - [ ] Дальнейшая работа над внешним видом форм. Выравнивание и т.д.
- [ ] Интеграция элементов дерева с данными об ошибках в связанных модулях - [#6](https://github.com/zerobig/vscode-1c-metadata-viewer/issues/6)

<br>

## Скриншоты


![Скриншот предпросмотра формы](/resources/screenshot_2.png)
![Скриншот табличного документа](/resources/screenshot_1.png)

<hr>

> Licensed under the MIT license
