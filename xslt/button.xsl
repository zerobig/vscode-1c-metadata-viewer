<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="3.0"
    xpath-default-namespace="http://v8.1c.ru/8.3/xcf/logform"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:v8="http://v8.1c.ru/8.1/data/core"
    xmlns:xr="http://v8.1c.ru/8.3/xcf/readable"
>

    <xsl:template match="Button">
        <xsl:variable name="commandName" select="tokenize(CommandName, '\.')[last()]" />
        <xsl:choose>
            <!-- Гиперссылка -->
            <xsl:when test="Type = 'Hyperlink'">
                <div class="element">
                    <xsl:if test="Picture or /Form/Commands/Command[@name=$commandName]/Picture/xr:Ref">
                        <img>
                            <xsl:attribute name="src">
                                <xsl:choose>
                                    <!-- Картинка задана на кнопке -->
                                    <xsl:when test="Picture">
                                        <xsl:choose>
                                            <xsl:when test="contains(Picture/xr:Ref, 'StdPicture.')">
                                                <xsl:value-of select="concat(Picture/xr:Ref, '.svg')" />
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <xsl:value-of select="concat(Picture/xr:Ref, '/Ext/Picture/Picture.png')" />
                                            </xsl:otherwise>
                                        </xsl:choose>
                                    </xsl:when>
                                    <!-- Картинка определена в команде -->
                                    <xsl:otherwise>
                                        <xsl:choose>
                                            <xsl:when test="contains(/Form/Commands/Command[@name=$commandName]/Picture/xr:Ref, 'StdPicture.')">
                                                <xsl:value-of select="concat(/Form/Commands/Command[@name=$commandName]/Picture/xr:Ref, '.svg')" />
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <xsl:value-of select="concat(/Form/Commands/Command[@name=$commandName]/Picture/xr:Ref, '/Ext/Picture/Picture.png')" />
                                            </xsl:otherwise>
                                        </xsl:choose>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:attribute>
                        </img>
                    </xsl:if>
                    <a href="#">
                        <xsl:choose>
                            <!-- Текст из кнопки -->
                            <xsl:when test="Title">
                                <xsl:value-of select="Title/v8:item/v8:content/text()" />
                            </xsl:when>
                            <!-- Текст из команды -->
                            <xsl:when test="/Form/Commands/Command[@name=$commandName]/Title">
                                <xsl:value-of select="/Form/Commands/Command[@name=$commandName]/Title/v8:item/v8:content/text()" />
                            </xsl:when>
                            <!-- Текст из идентификатора команды через camel case преобразование -->
                            <xsl:otherwise>
                                <xsl:call-template name="SplitCamelCase">
                                    <xsl:with-param name="text" select="$commandName" />
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
                        <xsl:choose>
                            <!-- Кнопка с картинкой -->
                            <xsl:when test="Representation = 'Picture'">
                                <img>
                                    <xsl:attribute name="src">
                                        <xsl:choose>
                                            <!-- Картинка задана на кнопке -->
                                            <xsl:when test="Picture">
                                                <xsl:choose>
                                                    <xsl:when test="contains(Picture/xr:Ref, 'StdPicture.')">
                                                        <xsl:value-of select="concat(Picture/xr:Ref, '.svg')" />
                                                    </xsl:when>
                                                    <xsl:otherwise>
                                                        <xsl:value-of select="concat(Picture/xr:Ref, '/Ext/Picture/Picture.png')" />
                                                    </xsl:otherwise>
                                                </xsl:choose>
                                            </xsl:when>
                                            <!-- Картинка определена в команде -->
                                            <xsl:otherwise>
                                                <xsl:choose>
                                                    <xsl:when test="contains(/Form/Commands/Command[@name=$commandName]/Picture/xr:Ref, 'StdPicture.')">
                                                        <xsl:value-of select="concat(/Form/Commands/Command[@name=$commandName]/Picture/xr:Ref, '.svg')" />
                                                    </xsl:when>
                                                    <xsl:otherwise>
                                                        <xsl:value-of select="concat(/Form/Commands/Command[@name=$commandName]/Picture/xr:Ref, '/Ext/Picture/Picture.png')" />
                                                    </xsl:otherwise>
                                                </xsl:choose>
                                            </xsl:otherwise>
                                        </xsl:choose>
                                    </xsl:attribute>
                                </img>
                            </xsl:when>
                            <!-- Только текст и текст задан на кнопке -->
                            <xsl:when test="Representation = 'Text' and Title">
                                <xsl:value-of select="Title/v8:item/v8:content/text()" />
                            </xsl:when>
                            <!-- Только текст и текст определен в команде -->
                            <xsl:when test="Representation = 'Text' and not(Title)">
                                <xsl:value-of select="/Form/Commands/Command[@name=$commandName]/Title/v8:item/v8:content/text()" />
                            </xsl:when>
                            <xsl:otherwise>
                                <!-- TextAndPicture -->
                                <!-- TODO: -->
                                <xsl:value-of select="@name" />
                            </xsl:otherwise>
                        </xsl:choose>
                    </button>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>