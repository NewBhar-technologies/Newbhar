Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:/Users/barma/.gemini/antigravity/brain/7871e7df-e89e-4636-9aec-23dd47ff8dac/.user_uploaded/media_1795489680543_9e91ca34.jpg'
$srcBmp = [System.Drawing.Bitmap]::FromFile($sourcePath)

# Tight crop of the emblem
$minX = 120; $maxX = 902; $minY = 114; $maxY = 902
$size = [Math]::Max($maxX - $minX, $maxY - $minY)
$pad = 20
$cropSize = $size + ($pad * 2)
$cropX = [Math]::Max(0, [int]($minX + ($maxX - $minX)/2 - $cropSize/2))
$cropY = [Math]::Max(0, [int]($minY + ($maxY - $minY)/2 - $cropSize/2))

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
$croppedBmp = $srcBmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Helper function to resize
function Resize-Bitmap($bmp, $targetWidth, $targetHeight) {
    $dest = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($bmp, 0, 0, $targetWidth, $targetHeight)
    $g.Dispose()
    return $dest
}

# 1. Generate newbhar-banner.jpg (1200 x 630 - OpenGraph Card)
$bannerW = 1200
$bannerH = 630
$bannerBmp = New-Object System.Drawing.Bitmap($bannerW, $bannerH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$bgGraphics = [System.Drawing.Graphics]::FromImage($bannerBmp)
$bgGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$bgGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$bgGraphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Dark modern background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(8, 8, 10))
$bgGraphics.FillRectangle($bgBrush, 0, 0, $bannerW, $bannerH)

# Draw elegant subtle border
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 255, 255, 255), 2)
$bgGraphics.DrawRectangle($borderPen, 1, 1, $bannerW - 2, $bannerH - 2)
$borderPen.Dispose()

# Draw emblem at (100, 145), size 340x340
$emblemSize = 340
$emblemResized = Resize-Bitmap $croppedBmp $emblemSize $emblemSize
$bgGraphics.DrawImage($emblemResized, 90, 145, $emblemSize, $emblemSize)
$emblemResized.Dispose()

# Draw Typography on the right side
$fontFamilyTitle = "Segoe UI"
$fontFamilyBody = "Segoe UI"

# Company Title: "Newbhar" in white, "Technologies" in lime/teal
$titleFont = New-Object System.Drawing.Font($fontFamilyTitle, 44, [System.Drawing.FontStyle]::Bold)
$titleBrushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255))
$titleBrushAccent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 235, 145))

$bgGraphics.DrawString("New", $titleFont, $titleBrushWhite, 470, 180)
$newSize = $bgGraphics.MeasureString("New", $titleFont)
$bgGraphics.DrawString("bhar", $titleFont, $titleBrushAccent, 470 + $newSize.Width - 14, 180)

# Tagline pill
$tagFont = New-Object System.Drawing.Font($fontFamilyBody, 13, [System.Drawing.FontStyle]::Bold)
$tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(156, 163, 175))
$bgGraphics.DrawString("TECHNOLOGIES", $tagFont, $tagBrush, 474, 245)

# Separator line
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(45, 255, 255, 255), 1)
$bgGraphics.DrawLine($linePen, 474, 280, 1080, 280)
$linePen.Dispose()

# Subtitle / Value proposition for SEO social share
$subFont = New-Object System.Drawing.Font($fontFamilyBody, 22, [System.Drawing.FontStyle]::Bold)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 240, 245))
$bgGraphics.DrawString("Engineering Digital Excellence", $subFont, $subBrush, 474, 305)

$descFont = New-Object System.Drawing.Font($fontFamilyBody, 15, [System.Drawing.FontStyle]::Regular)
$descBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 165, 180))
$descRect = New-Object System.Drawing.RectangleF(474, 355, 620, 120)
$bgGraphics.DrawString("Custom Software Development • Web Platforms • Mobile Apps • AI Solutions • Cloud Engineering", $descFont, $descBrush, $descRect)

# Website URL badge
$urlFont = New-Object System.Drawing.Font($fontFamilyBody, 14, [System.Drawing.FontStyle]::Bold)
$urlBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 235, 145))
$bgGraphics.DrawString("newbhar.com", $urlFont, $urlBrush, 474, 450)

# Save banner as JPEG with high quality
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)
$bannerBmp.Save("public/newbhar-banner.jpg", $codec, $encoderParams)
Write-Host "Generated public/newbhar-banner.jpg (1200x630)"

$bgBrush.Dispose()
$titleBrushWhite.Dispose()
$titleBrushAccent.Dispose()
$tagBrush.Dispose()
$subBrush.Dispose()
$descBrush.Dispose()
$urlBrush.Dispose()
$titleFont.Dispose()
$tagFont.Dispose()
$subFont.Dispose()
$descFont.Dispose()
$urlFont.Dispose()
$bgGraphics.Dispose()
$bannerBmp.Dispose()

# 2. Generate newbhar-logo.jpg (1024 x 341 - Standard 3:1 Lockup)
$logoW = 1024
$logoH = 341
$logoBmp = New-Object System.Drawing.Bitmap($logoW, $logoH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$lgGraphics = [System.Drawing.Graphics]::FromImage($logoBmp)
$lgGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$lgGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$lgGraphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$logoBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(8, 8, 10))
$lgGraphics.FillRectangle($logoBg, 0, 0, $logoW, $logoH)

$markSz = 250
$markResized = Resize-Bitmap $croppedBmp $markSz $markSz
$lgGraphics.DrawImage($markResized, 60, [int](($logoH - $markSz)/2), $markSz, $markSz)
$markResized.Dispose()

$lgTitleFont = New-Object System.Drawing.Font("Segoe UI", 56, [System.Drawing.FontStyle]::Bold)
$lgTitleWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255))
$lgTitleAccent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 235, 145))
$lgGraphics.DrawString("New", $lgTitleFont, $lgTitleWhite, 350, 95)
$lgNewSz = $lgGraphics.MeasureString("New", $lgTitleFont)
$lgGraphics.DrawString("bhar", $lgTitleFont, $lgTitleAccent, 350 + $lgNewSz.Width - 18, 95)

$lgTagFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$lgTagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(156, 163, 175))
$lgGraphics.DrawString("TECHNOLOGIES", $lgTagFont, $lgTagBrush, 356, 185)

$logoBmp.Save("public/newbhar-logo.jpg", $codec, $encoderParams)
Write-Host "Generated public/newbhar-logo.jpg (1024x341)"

$logoBg.Dispose()
$lgTitleWhite.Dispose()
$lgTitleAccent.Dispose()
$lgTagBrush.Dispose()
$lgTitleFont.Dispose()
$lgTagFont.Dispose()
$lgGraphics.Dispose()
$logoBmp.Dispose()

$croppedBmp.Dispose()
$srcBmp.Dispose()
Write-Host "Done generating banner and logo lockup!"
