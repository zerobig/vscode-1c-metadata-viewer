<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="3.0"
    xpath-default-namespace="http://v8.1c.ru/8.3/xcf/logform"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:v8="http://v8.1c.ru/8.1/data/core"
    xmlns:xr="http://v8.1c.ru/8.3/xcf/readable">

    <xsl:output method="html" />

    <xsl:import href="button.xsl" />
    <xsl:import href="checkbox-field.xsl" />
    <xsl:import href="input-field.xsl" />
    <xsl:import href="label-decoration.xsl" />
    <xsl:import href="label-field.xsl" />
    <xsl:import href="select-field.xsl" />

    <xsl:import href="func/split-camel-case.xsl" />

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
                        <div>
                            <xsl:apply-templates select="/Form/AutoCommandBar/ChildItems" />
                        </div>
                        <div>
                            <xsl:choose>
                                <xsl:when test="/Form/Group">
                                    <xsl:attribute name="class">
                                        <xsl:value-of select="concat('group-content group-', translate(/Form/Group, $uppercase, $lowercase))" />
                                    </xsl:attribute>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:attribute name="class">
                                        <xsl:value-of select="'group-content group-vertical'" />
                                    </xsl:attribute>
                                </xsl:otherwise>
                            </xsl:choose>
                            <xsl:apply-templates select="/Form/ChildItems" />
                        </div>
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
                    <xsl:if test="not(Visible = 'false')">
                        <xsl:apply-templates select="." />
                    </xsl:if>
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
                    <xsl:if test="not(Visible = 'false')">
                        <xsl:choose>
                            <xsl:when test="InputField/ListChoiceMode = 'true'">
                                <xsl:apply-templates select="./ChoiceList" />
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:apply-templates select="." />
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:if>
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
                <xsl:when test="name() = 'PictureDecoration'">
                    <!-- TODO: -->
                </xsl:when>
                <xsl:when test="name() = 'PictureField'">
                    <!-- TODO: -->
                </xsl:when>
                <xsl:when test="name() = 'Popup'">
                    <!-- TODO: -->
                </xsl:when>
                <xsl:when test="name() = 'RadioButtonField'">
                    <!-- TODO: -->
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

    <xsl:template match="Pages">
        <div class="tabbed">
            <xsl:for-each select="ChildItems/Page">
                <xsl:if test="count(ChildItems) > 0">
                    <xsl:call-template name="PageInput">
                        <xsl:with-param name="node" select="." />
                        <xsl:with-param name="position" select="position()" />
                    </xsl:call-template>
                </xsl:if>
            </xsl:for-each>
            <ul class="tabs">
                <xsl:for-each select="ChildItems/Page">
                    <xsl:if test="count(ChildItems) > 0">
                        <xsl:call-template name="PageLabel">
                            <xsl:with-param name="node" select="." />
                            <xsl:with-param name="position" select="position()" />
                        </xsl:call-template>
                    </xsl:if>
                </xsl:for-each>
            </ul>
            <xsl:for-each select="ChildItems/Page">
                <xsl:if test="count(ChildItems) > 0">
                    <xsl:call-template name="PageContent">
                        <xsl:with-param name="node" select="." />
                    </xsl:call-template>
                </xsl:if>
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

</xsl:stylesheet>
