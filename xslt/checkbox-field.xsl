<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="3.0"
    xpath-default-namespace="http://v8.1c.ru/8.3/xcf/logform"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:v8="http://v8.1c.ru/8.1/data/core"
    xmlns:xr="http://v8.1c.ru/8.3/xcf/readable"
>

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

</xsl:stylesheet>
