# Вывод дерева метаданных конфигурации 1С и открытие модулей в VSC

Расширение анализирует файл ConfigDumpInfo.xml выгруженной конфигурации 1С и строит дерево метаданных в панели VS Code.

![Скриншот дерева метаданных](/resources/screenshot.png)

Открывает текстовые модули 1С (*.bsl) через контекстное меню у соответствующих элементов.

Функция просмотра предопределенных элементов.

## Метаданные и модули

### Типы метаданных

* Параметры сеанса
* Роли
* Общие реквизиты
* Планы обмена
* Константы
* Справочники
* Документы
* Журналы документов
* Перечисления
* Отчеты
* Обработки
* Планы видов характеристик
* Планы счетов
* Планы видов расчета
* Регистры сведений
* Регистры накопления
* Регистры бухгалтерии
* Регистры расчета
* Бизнес-процессы
* Задачи
* Внешние источники данных

### Модули

* Модуль приложения
* Модуль сеанса
* Общий модуль
* Модуль объекта
* Модуль менеджера
* Модуль формы
* Модуль команды
* Модуль записи
* Модуль менеджера значения (для констант)

## Что ещё планируется

* Расширение количества обрабатываемых типов метаданных
* Открытие модуля без контекстного меню по двойному щелчку когда модуль у элемента конфигурации один
* Редактирование свойств метаданных в отдельной панели