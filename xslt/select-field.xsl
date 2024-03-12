<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="3.0"
    xpath-default-namespace="http://v8.1c.ru/8.3/xcf/logform"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:v8="http://v8.1c.ru/8.1/data/core"
    xmlns:xr="http://v8.1c.ru/8.3/xcf/readable"
>

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

</xsl:stylesheet>
