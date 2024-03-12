<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="3.0"
    xpath-default-namespace="http://v8.1c.ru/8.3/xcf/logform"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:v8="http://v8.1c.ru/8.1/data/core"
    xmlns:xr="http://v8.1c.ru/8.3/xcf/readable"
>

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
                    <xsl:if test="TitleLocation = 'Top'">
                        <xsl:attribute name="class">
                            <xsl:value-of select="'label-top'" />
                        </xsl:attribute>
                    </xsl:if>
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
                                    <xsl:value-of select="concat($dataPath, ': ')" />
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

</xsl:stylesheet>