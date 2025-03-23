import * as vscode from 'vscode';
import { MetadataView } from '../metadataView';
import { MetadataItem } from '../model/metadataItem';
import { TreeItem } from '../ConfigurationFormats/utils';

export class QuickNavigateMetadataCommand {
    private metadataView: MetadataView;

    constructor(metadataView: MetadataView) {
        this.metadataView = metadataView;
    }

    public async execute() {
        // Получаем все метаданные из просмотрщика
        const allMetadata = await this.getAllMetadataItems();
        
        if (!allMetadata || allMetadata.length === 0) {
            vscode.window.showInformationMessage('Метаданные не найдены. Убедитесь, что открыт проект 1С.');
            return;
        }

        // Создаем интерфейс быстрого выбора
        const quickPick = vscode.window.createQuickPick<MetadataQuickPickItem>();
        quickPick.placeholder = 'Введите часть названия объекта метаданных (например, "общего назначения")';
        quickPick.matchOnDescription = true;
        quickPick.matchOnDetail = true;
        
        // Начальный список всех элементов
        const allItems = allMetadata.map(item => this.createQuickPickItem(item));
        quickPick.items = allItems;
        
        // Обработчик изменения текста поиска
        quickPick.onDidChangeValue(() => {
            if (quickPick.value.length > 0) {
                const searchTerms = quickPick.value.toLowerCase().split(' ');
                quickPick.items = allItems.filter(item => {
                    return this.matchesSearchTerms(item, searchTerms);
                });
            } else {
                quickPick.items = allItems;
            }
        });
        
        // Обработчик выбора элемента
        quickPick.onDidAccept(async () => {
            const selectedItem = quickPick.selectedItems[0];
            if (selectedItem) {
                quickPick.hide();
                
                // Находим элемент метаданных, который был выбран
                const metadataItem = selectedItem.metadata;
                
                // Открываем элемент в просмотрщике метаданных
                await this.openMetadataItem(metadataItem);
            }
        });
        
        // Показываем интерфейс быстрого выбора
        quickPick.show();
    }
    
    private async getAllMetadataItems(): Promise<MetadataItem[]> {
        // Получаем все элементы метаданных
        const treeItems = await this.getTreeItems();
        return this.convertTreeItemsToMetadataItems(treeItems);
    }
    
    private async getTreeItems(): Promise<TreeItem[]> {
        // Проверяем наличие dataProvider в metadataView
        if (!this.metadataView.dataProvider) {
            return [];
        }
        
        // Получаем корневые элементы через dataProvider
        const rootItems = await this.metadataView.dataProvider.getChildren();
        if (!rootItems || rootItems.length === 0) {
            return [];
        }
        
        // Ищем конфигурации (обычно первый элемент)
        const configurationsItem = rootItems[0];
        if (!configurationsItem) {
            return [];
        }
        
        // Получаем дочерние элементы конфигураций
        const configChildren = await this.metadataView.dataProvider.getChildren(configurationsItem);
        return configChildren || [];
    }
    
    private convertTreeItemsToMetadataItems(items: TreeItem[], parent?: MetadataItem): MetadataItem[] {
        const result: MetadataItem[] = [];
        
        items.forEach(item => {
            // Преобразуем TreeItem в MetadataItem
            const metadataItem: MetadataItem = {
                id: item.id || '',
                name: typeof item.label === 'string' ? item.label : item.label?.label || '',
                type: item.contextValue || '',
                file: item.path,
                parent: parent
            };
            
            result.push(metadataItem);
            
            // Рекурсивно обрабатываем дочерние элементы
            if (item.children && item.children.length > 0) {
                const childItems = this.convertTreeItemsToMetadataItems(item.children, metadataItem);
                metadataItem.children = childItems;
                result.push(...childItems);
            }
        });
        
        return result;
    }
    
    private createQuickPickItem(metadata: MetadataItem): MetadataQuickPickItem {
        // Формируем путь для отображения
        const path = this.getMetadataPath(metadata);
        
        return {
            label: metadata.name,
            description: path,
            detail: metadata.type,
            metadata: metadata
        };
    }
    
    private getMetadataPath(metadata: MetadataItem): string {
        // Формируем путь в виде "Тип\Имя\Подтип"
        let current: MetadataItem | undefined = metadata;
        const pathParts: string[] = [];
        
        while (current) {
            pathParts.unshift(current.name);
            current = current.parent;
        }
        
        return pathParts.join('\\');
    }
    
    private matchesSearchTerms(item: MetadataQuickPickItem, searchTerms: string[]): boolean {
        // Собираем все возможные варианты названия
        const itemLabel = item.label.toLowerCase();
        const itemDescription = item.description?.toLowerCase() || '';
        const itemDetail = item.detail?.toLowerCase() || '';

        // Разбиваем название метаданных на части (например, "ОбщегоНазначенияБТС" -> "общего", "назначения", "бтс")
        const nameParts: string[] = [];
        
        // Разбиваем CamelCase строки
        const splitCamelCase = (text: string): string[] => {
            // Преобразуем кириллицу из CamelCase в отдельные слова
            return text.replace(/([а-яА-Я])(?=[А-Я])/g, '$1 ').toLowerCase().split(' ');
        };
        
        // Получаем части имени из различных источников
        const labelParts = splitCamelCase(item.label);
        nameParts.push(...labelParts);
        
        // Добавляем полное имя метаданных (например "CommonModule.ОбщегоНазначения")
        if (itemDescription.includes('\\')) {
            const parts = itemDescription.split('\\');
            for (const part of parts) {
                // Разбиваем каждую часть пути на слова
                nameParts.push(...splitCamelCase(part));
                
                // Добавляем также полные пути для поиска
                nameParts.push(part);
            }
        }
        
        // Добавляем тип метаданных (для поиска по типу)
        if (itemDetail) {
            nameParts.push(itemDetail);
        }
        
        // Собираем все строки для поиска
        const textToSearch = [
            // Полное название элемента
            itemLabel,
            // Все части для сопоставления с сокращениями
            ...nameParts,
            // Полный путь
            itemDescription,
            // Тип
            itemDetail
        ].join(' ').toLowerCase();
        
        // Проверяем, содержится ли каждый поисковый термин в строке для поиска
        // или соответствует ли он началу какой-либо части названия (для сокращений)
        return searchTerms.every(term => {
            // Прямое вхождение в какую-либо строку поиска
            if (textToSearch.includes(term)) {
                return true;
            }
            
            // Проверка на сокращения (например "общ" -> "общего")
            // Ищем части, которые начинаются с поискового термина
            for (const part of nameParts) {
                if (part.startsWith(term)) {
                    return true;
                }
            }
            
            // Также проверяем совпадение с транслитерацией
            // Например, "obsh" -> "общего"
            const translitMap: {[key: string]: string} = {
                'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'yo': 'ё', 'zh': 'ж',
                'z': 'з', 'i': 'и', 'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о',
                'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф', 'h': 'х', 'ts': 'ц',
                'ch': 'ч', 'sh': 'ш', 'sch': 'щ', 'y': 'ы', 'yu': 'ю', 'ya': 'я'
            };
            
            // Преобразуем латинский поисковый термин в кириллицу для поиска
            let translitTerm = term;
            for (const [latin, cyrillic] of Object.entries(translitMap)) {
                translitTerm = translitTerm.replace(new RegExp(latin, 'g'), cyrillic);
            }
            
            if (translitTerm !== term && textToSearch.includes(translitTerm)) {
                return true;
            }
            
            return false;
        });
    }
    
    private async openMetadataItem(metadata: MetadataItem): Promise<void> {
        // Если у элемента есть путь к файлу, открываем его
        if (metadata.file) {
            try {
                const document = await vscode.workspace.openTextDocument(metadata.file);
                await vscode.window.showTextDocument(document);
            } catch (error) {
                console.error(`Ошибка при открытии файла ${metadata.file}:`, error);
            }
        }
        
        // Находим соответствующий TreeItem в дереве
        // Используем dataProvider для обхода дерева
        const treeItem = await this.findTreeItemById(metadata.id);
        
        if (treeItem) {
            // Выполняем команду для открытия соответствующего модуля
            // в зависимости от типа элемента метаданных
            await this.executeCommandForTreeItem(treeItem);
            
            // Выделяем элемент в дереве метаданных
            await this.revealTreeItem(treeItem);
        }
    }
    
    private async findTreeItemById(id: string): Promise<TreeItem | undefined> {
        if (!this.metadataView.dataProvider) {
            return undefined;
        }
        
        // Получаем корневые элементы
        const rootItems = await this.metadataView.dataProvider.getChildren();
        if (!rootItems || rootItems.length === 0) {
            return undefined;
        }
        
        // Ищем элемент по ID с помощью рекурсивной функции
        return this.findTreeItemByIdRecursive(rootItems, id);
    }
    
    private async findTreeItemByIdRecursive(items: TreeItem[], id: string): Promise<TreeItem | undefined> {
        for (const item of items) {
            if (item.id === id) {
                return item;
            }
            
            if (item.children && item.children.length > 0) {
                const found = await this.findTreeItemByIdRecursive(item.children, id);
                if (found) {
                    return found;
                }
            } else if (this.metadataView.dataProvider) {
                // Если у элемента нет детей в памяти, попробуем получить их через dataProvider
                const children = await this.metadataView.dataProvider.getChildren(item);
                if (children && children.length > 0) {
                    const found = await this.findTreeItemByIdRecursive(children, id);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        
        return undefined;
    }
    
    private async executeCommandForTreeItem(item: TreeItem): Promise<void> {
        // Выполняем соответствующую команду в зависимости от типа элемента
        if (item.command) {
            if (typeof item.command === 'string') {
                await vscode.commands.executeCommand(item.command);
            } else if (item.command.command) {
                await vscode.commands.executeCommand(item.command.command, ...(item.command.arguments || []));
            }
        } else if (item.contextValue) {
            // Определяем, какую команду выполнить на основе contextValue
            if (item.contextValue.includes('form')) {
                await vscode.commands.executeCommand('metadataViewer.openForm', item);
            } else if (item.contextValue.includes('object')) {
                await vscode.commands.executeCommand('metadataViewer.openObjectModule', item);
            } else if (item.contextValue.includes('manager')) {
                await vscode.commands.executeCommand('metadataViewer.openManagerModule', item);
            } else if (item.contextValue.includes('module')) {
                await vscode.commands.executeCommand('metadataViewer.openModule', item);
            }
        }
    }
    
    private async revealTreeItem(item: TreeItem): Promise<void> {
        // Прокручиваем дерево к выбранному элементу
        await vscode.commands.executeCommand('metadataView.reveal', item);
    }
}

// Интерфейс для элементов быстрого выбора
interface MetadataQuickPickItem extends vscode.QuickPickItem {
    metadata: MetadataItem;
} 