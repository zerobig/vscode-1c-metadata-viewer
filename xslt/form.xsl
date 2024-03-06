<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="3.0"
    xpath-default-namespace="http://v8.1c.ru/8.3/xcf/logform"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:v8="http://v8.1c.ru/8.1/data/core"
    xmlns:xr="http://v8.1c.ru/8.3/xcf/readable">

    <xsl:output method="html" />

    <xsl:variable name="lowercase" select="'abcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя'" />
    <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'" />
    <xsl:variable name="digits">0123456789</xsl:variable>

    <xsl:template match="/">
        <html>
            <head>
                <style></style>
            </head>
            <body>
                <div class="window">
                    <div class="window-header">
                    </div>
                    <div class="window-content">
                        <xsl:apply-templates select="/Form/ChildItems" />
                    </div>
                </div>
                <script></script>
            </body>
        </html>
    </xsl:template>

    <xsl:template match="ChildItems">
        <xsl:for-each select="*">
            <xsl:choose>
                <xsl:when test="name() = 'Button'">
                    <xsl:apply-templates select="." />
                </xsl:when>
                <xsl:when test="name() = 'ButtonGroup'">
                    <!-- TODO: -->
                </xsl:when>
                <xsl:when test="name() = 'CheckBoxField'">
                    <xsl:apply-templates select="." />
                </xsl:when>
                <xsl:when test="name() = 'ColumnGroup'">
                    <xsl:apply-templates select="./ChildItems" />
                </xsl:when>
                <xsl:when test="name() = 'CommandBar'">
                    <xsl:apply-templates select="." />
                </xsl:when>
                <xsl:when test="name() = 'InputField'">
                    <xsl:choose>
                        <xsl:when test="InputField/ListChoiceMode = 'true'">
                            <xsl:apply-templates select="./ChoiceList" />
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:apply-templates select="." />
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:when test="name() = 'LabelDecoration'">
                    <xsl:apply-templates select="." />
                </xsl:when>
                <xsl:when test="name() = 'LabelField'">
                    <xsl:apply-templates select="." />
                </xsl:when>
                <xsl:when test="name() = 'Pages'">
                    <xsl:apply-templates select="." />
                </xsl:when>
                <xsl:when test="name() = 'SearchStringAddition'">
                    <!-- TODO: -->
                </xsl:when>
                <xsl:when test="name() = 'Table'">
                    <xsl:apply-templates select="." />
                </xsl:when>
                <xsl:when test="name() = 'UsualGroup'">
                    <xsl:apply-templates select="." />
                </xsl:when>
                <xsl:otherwise>
                    <div>Обработка элемента <xsl:value-of select="name()" /> не предусмотрена!</div>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="UsualGroup|CommandBar">
        <div class="group">
            <xsl:if test="Visible = 'false'">
                <xsl:attribute name="style">
                    <xsl:value-of select="'display: none;'" />
                </xsl:attribute>
            </xsl:if>
            <span class="group-caption"><xsl:value-of select="@name" /></span>
            <xsl:if test="name() = 'UsualGroup' and Title and (not(ShowTitle) or ShowTitle = 'true')">
                <div class="group-title">
                    <xsl:value-of select="Title/v8:item/v8:content/text()" />
                </div>
            </xsl:if>
            <div>
                <xsl:attribute name="class">
                    <xsl:choose>
                        <xsl:when test="Group">
                            <xsl:value-of select="concat('group-content', ' group-', translate(Group, $uppercase, $lowercase))" />
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="'group-content'" />
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:attribute>
                <xsl:apply-templates select="ChildItems" />
            </div>
            <!-- Tooltip группы -->
            <xsl:if test="ExtendedTooltip/Title">
                <div>
                    <xsl:attribute name="class">
                        <xsl:value-of select="'tooltip'" />
                    </xsl:attribute>
                    <xsl:sequence
                        select="replace(ExtendedTooltip/Title/v8:item/v8:content/text(), '\n', '$1&lt;br /&gt;$2')"
                    />
                </div>
            </xsl:if>
        </div>
    </xsl:template>

    <xsl:template match="LabelDecoration">
        <div class="label">
            <xsl:if test="Width">
                <xsl:attribute name="style">
                    <xsl:value-of select="concat('width: ', number(Width) * 10, 'px;')" />
                </xsl:attribute>
            </xsl:if>
            <xsl:value-of select="Title/v8:item/v8:content/text()" />
        </div>
    </xsl:template>

    <xsl:template match="Button">
        <xsl:choose>
            <xsl:when test="Type = 'Hyperlink'">
                <div class="element">
                    <a href="#">
                        <xsl:choose>
                            <xsl:when test="Title">
                                <xsl:value-of select="Title/v8:item/v8:content/text()" />
                            </xsl:when>
                            <xsl:otherwise>
                                <!-- TODO: <xsl:evaluate xpath="CommandName/text()" /> -->
                                <xsl:call-template name="SplitCamelCase">
                                    <xsl:with-param name="text" select="@name" />
                                </xsl:call-template>
                            </xsl:otherwise>
                        </xsl:choose>
                    </a>
                </div>
                <xsl:if test="ExtendedTooltip/Title">
                    <div class="tooltip">
                        <xsl:value-of select="ExtendedTooltip/Title/v8:item/v8:content/text()" />
                    </div>
                </xsl:if>
            </xsl:when>
            <xsl:otherwise>
                <xsl:if test="not(LocationInCommandBar = 'InAdditionalSubmenu')">
                    <button>
                        <xsl:value-of select="@name" />
                    </button>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="InputField">
        <xsl:choose>
            <!-- Колонка таблицы -->
            <xsl:when test="../../name() = 'Table' or ../../name() = 'ColumnGroup'">
                <th>
                    <xsl:if test="not(Width)">
                        <xsl:attribute name="style">
                            <xsl:value-of select="'width: 100%'" />
                        </xsl:attribute>
                    </xsl:if>
                    <div>
                        <xsl:if test="Width">
                            <xsl:attribute name="style">
                                <xsl:value-of select="concat('width: ', number(Width) * 10, 'px;')" />
                            </xsl:attribute>
                        </xsl:if>
                        <xsl:value-of select="DataPath" />
                    </div>
                </th>
            </xsl:when>
            <xsl:otherwise>
                <!-- Обычное поле формы -->
                <div class="element">
                    <xsl:if test="HorizontalStretch = 'true'">
                        <xsl:attribute name="style">
                            <xsl:value-of select="'width: 100%'" />
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:if test="not(TitleLocation = 'None')">
                        <label>
                            <xsl:variable name="dataPath" select="DataPath"/>
                            <xsl:choose>
                                <xsl:when test="Title">
                                    <xsl:value-of select="concat(Title/v8:item/v8:content/text(), ': ')" />
                                </xsl:when>
                                <xsl:when test="starts-with($dataPath, 'Объект.')">
                                    <xsl:value-of select="$dataPath" />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="concat(/Form/Attributes/Attribute[@name=$dataPath]/Title/v8:item/v8:content/text(), ': ')" />
                                </xsl:otherwise>
                            </xsl:choose>
                        </label>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="MultiLine = 'true'">
                            <textarea>
                                <xsl:if test="HorizontalStretch = 'true'">
                                    <xsl:attribute name="style">
                                        <xsl:value-of select="'width: 100%'" />
                                    </xsl:attribute>
                                </xsl:if>
                                <xsl:attribute name="rows">
                                    <xsl:value-of select="Height" />
                                </xsl:attribute>
                            </textarea>
                        </xsl:when>
                        <xsl:otherwise>
                            <input class="input">
                                <xsl:if test="InputHint">
                                    <xsl:attribute name="placeholder">
                                        <xsl:value-of select="InputHint/v8:item/v8:content" />
                                    </xsl:attribute>
                                </xsl:if>
                                <xsl:choose>
                                    <xsl:when test="Width">
                                        <xsl:attribute name="style">
                                            <xsl:value-of select="concat('width: ', number(Width) * 10, 'px;')" />
                                        </xsl:attribute>
                                    </xsl:when>
                                    <xsl:when test="HorizontalStretch = 'true'">
                                        <xsl:attribute name="style">
                                            <xsl:value-of select="'width: 100%'" />
                                        </xsl:attribute>
                                    </xsl:when>
                                </xsl:choose>
                            </input>
                        </xsl:otherwise>
                    </xsl:choose>
                </div>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="InputField/ChoiceList">
        <div class="element">
            <xsl:if test="not(TitleLocation = 'None')">
                <label>
                    <xsl:value-of select="concat(../Title/v8:item/v8:content/text(), ': ')" />
                </label>
            </xsl:if>
            <select class="input">
                <xsl:apply-templates select="xr:Item" />
            </select>
        </div>
    </xsl:template>

    <xsl:template match="xr:Item">
        <option>
            <xsl:attribute name="value">
                <xsl:value-of select="xr:Value/Value" />
            </xsl:attribute>
            <xsl:value-of select="xr:Value/Presentation/v8:item/v8:content" />
        </option>
    </xsl:template>

    <xsl:template match="LabelField">
        <th>
            <xsl:if test="not(Width)">
                <xsl:attribute name="style">
                    <xsl:value-of select="'width: 100%'" />
                </xsl:attribute>
            </xsl:if>
            <div>
                <xsl:if test="Width">
                    <xsl:attribute name="style">
                        <xsl:value-of select="concat('width: ', number(Width) * 10, 'px;')" />
                    </xsl:attribute>
                </xsl:if>
                <xsl:value-of select="DataPath" />
            </div>
        </th>
    </xsl:template>

    <xsl:template match="CheckBoxField">
        <xsl:choose>
            <!-- Колонка таблицы -->
            <xsl:when test="../../name() = 'Table' or ../../name() = 'ColumnGroup'">
                <th>
                    <xsl:if test="not(Width)">
                        <xsl:attribute name="style">
                            <xsl:value-of select="'width: 100%'" />
                        </xsl:attribute>
                    </xsl:if>
                    <div>
                        <xsl:if test="Width">
                            <xsl:attribute name="style">
                                <xsl:value-of select="concat('width: ', number(Width) * 10, 'px;')" />
                            </xsl:attribute>
                        </xsl:if>
                        <xsl:value-of select="DataPath" />
                    </div>
                </th>
            </xsl:when>
            <xsl:otherwise>
                <!-- Обычное поле формы -->
                <div class="element">
                    <xsl:if test="not(TitleLocation) or TitleLocation = 'Left'">
                        <label>
                            <xsl:choose>
                                <xsl:when test="Title">
                                    <xsl:value-of select="Title/v8:item/v8:content/text()" />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:call-template name="SplitCamelCase">
                                        <xsl:with-param name="text" select="@name" />
                                    </xsl:call-template>
                                </xsl:otherwise>
                            </xsl:choose>
                        </label>
                    </xsl:if>
                    <input type="checkbox" />
                    <xsl:if test="TitleLocation = 'Right'">
                        <label>
                            <xsl:choose>
                                <xsl:when test="Title">
                                    <xsl:value-of select="Title/v8:item/v8:content/text()" />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:call-template name="SplitCamelCase">
                                        <xsl:with-param name="text" select="@name" />
                                    </xsl:call-template>
                                </xsl:otherwise>
                            </xsl:choose>
                        </label>
                    </xsl:if>
                </div>
                <xsl:if test="ExtendedTooltip/Title">
                    <div class="tooltip">
                        <xsl:value-of select="ExtendedTooltip/Title/v8:item/v8:content/text()" />
                    </div>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="Pages">
        <div class="tabbed">
            <xsl:for-each select="ChildItems/Page">
                <xsl:call-template name="PageInput">
                    <xsl:with-param name="node" select="." />
                    <xsl:with-param name="position" select="position()" />
                </xsl:call-template>
            </xsl:for-each>
            <ul class="tabs">
                <xsl:for-each select="ChildItems/Page">
                    <xsl:call-template name="PageLabel">
                        <xsl:with-param name="node" select="." />
                        <xsl:with-param name="position" select="position()" />
                    </xsl:call-template>
                </xsl:for-each>
            </ul>
            <xsl:for-each select="ChildItems/Page">
                <xsl:call-template name="PageContent">
                    <xsl:with-param name="node" select="." />
                </xsl:call-template>
            </xsl:for-each>
        </div>
    </xsl:template>

    <xsl:template name="PageInput">
        <xsl:param name="node" />
        <xsl:param name="position" />

        <input type="radio">
            <xsl:attribute name="id">
                <xsl:value-of select="concat('tab', $node/../../@id, '_', $position)" />
            </xsl:attribute>
            <xsl:attribute name="name">
                <xsl:value-of select="concat('tab-group', $node/../../@id)" />
            </xsl:attribute>
            <xsl:if test="$position = 1">
                <xsl:attribute name="checked">
                    <xsl:value-of select="''" />
                </xsl:attribute>
            </xsl:if>
        </input>
    </xsl:template>

    <xsl:template name="PageLabel">
        <xsl:param name="node" />
        <xsl:param name="position" />

        <li class="tab">
            <label>
                <xsl:attribute name="for">
                    <xsl:value-of select="concat('tab', $node/../../@id, '_', $position)" />
                </xsl:attribute>
                <xsl:if test="$node/../../PagesRepresentation = 'None'">
                    <xsl:attribute name="style">
                        <xsl:value-of select="'display: none'" />
                    </xsl:attribute>
                </xsl:if>
                <xsl:value-of select="$node/Title/v8:item/v8:content/text()" />
            </label>
        </li>
    </xsl:template>

    <xsl:template name="PageContent">
        <xsl:param name="node" />

        <section class="tab-content">
            <xsl:apply-templates select="$node/ChildItems" />
        </section>
    </xsl:template>
    
    <xsl:template match="Table">
        <xsl:if test="AutoCommandBar">
            <xsl:apply-templates select="AutoCommandBar/ChildItems" />
        </xsl:if>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <xsl:apply-templates select="ChildItems" />
                    </tr>
                </thead>
                <tbody>
                    <xsl:call-template name="TableRows">
                        <xsl:with-param name="nodes" select="ChildItems" />
                    </xsl:call-template>
                </tbody>
            </table>
        </div>
    </xsl:template>

    <xsl:template name="TableRows">
        <xsl:param name="nodes" />

        <xsl:for-each select="1 to 40">
            <tr>
                <xsl:for-each select="$nodes/*">
                    <!-- TODO: Надо обходить ещё и ColumnGroup'ы -->
                    <td>
                        <div>
                            <xsl:if test="Width">
                                <xsl:attribute name="style">
                                    <xsl:value-of select="concat('width: ', number(Width) * 10, 'px;')" />
                                </xsl:attribute>
                            </xsl:if>
                            <xsl:choose>
                                <xsl:when test="name() = 'CheckBoxField'">
                                    <input type="checkbox" />
                                </xsl:when>
                                <xsl:otherwise>
                                    &#160;
                                </xsl:otherwise>
                            </xsl:choose>
                        </div>
                    </td>
                </xsl:for-each>
            </tr>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="SplitCamelCase">
        <xsl:param name="text" />
        <xsl:param name="digitsMode" select="0" />
        <xsl:param name="firstIteration" select="0" />
        
        <xsl:if test="$text != ''">
            <xsl:variable name="letter" select="substring($text, 1, 1)" />
            <xsl:choose>
                <xsl:when test="$firstIteration != 0 and contains($uppercase, $letter)">
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="translate($letter, $uppercase, $lowercase)" />
                </xsl:when>
                <xsl:when test="contains($digits, $letter)">
                    <xsl:choose>
                        <xsl:when test="$digitsMode != 1">
                            <xsl:text> </xsl:text>
                        </xsl:when>
                    </xsl:choose>
                    <xsl:value-of select="$letter" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$letter"/>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:call-template name="SplitCamelCase">
                <xsl:with-param name="text" select="substring-after($text, $letter)" />
                <xsl:with-param name="digitsMode" select="contains($digits, $letter)" />
                <xsl:with-param name="firstIteration" select="1" />
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

</xsl:stylesheet>
