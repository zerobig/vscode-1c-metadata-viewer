<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="3.0"
    xpath-default-namespace="http://v8.1c.ru/8.3/xcf/logform"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:v8="http://v8.1c.ru/8.1/data/core"
    xmlns:xr="http://v8.1c.ru/8.3/xcf/readable"
>

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

</xsl:stylesheet>
