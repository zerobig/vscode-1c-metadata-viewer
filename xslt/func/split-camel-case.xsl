<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="3.0"
    xpath-default-namespace="http://v8.1c.ru/8.3/xcf/logform"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:v8="http://v8.1c.ru/8.1/data/core"
    xmlns:xr="http://v8.1c.ru/8.3/xcf/readable"
>

    <xsl:variable name="lowercase" select="'abcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя'" />
    <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'" />
    <xsl:variable name="digits">0123456789</xsl:variable>

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
