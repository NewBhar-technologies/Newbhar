Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:/Users/barma/.gemini/antigravity/brain/7871e7df-e89e-4636-9aec-23dd47ff8dac/.user_uploaded/media_1795489680543_9e91ca34.jpg'
$srcBmp = [System.Drawing.Bitmap]::FromFile($sourcePath)

# 1. Determine bounding box
$minX = $srcBmp.Width; $minY = $srcBmp.Height; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $srcBmp.Height; $y += 2) {
    for ($x = 0; $x -lt $srcBmp.Width; $x += 2) {
        $p = $srcBmp.GetPixel($x, $y)
        # Check if pixel has color (green/cyan or glow)
        if ($p.R -gt 12 -or $p.G -gt 12 -or $p.B -gt 12) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Found logo bounds: X: $minX to $maxX, Y: $minY to $maxY"

# Add small padding (approx 3% of size)
$pad = 24
$cropX = [Math]::Max(0, $minX - $pad)
$cropY = [Math]::Max(0, $minY - $pad)
$cropW = [Math]::Min($srcBmp.Width - $cropX, ($maxX - $minX) + ($pad * 2))
$cropH = [Math]::Min($srcBmp.Height - $cropY, ($maxY - $minY) + ($pad * 2))

# Make it square
$squareSize = [Math]::Max($cropW, $cropH)
$cropX = [Math]::Max(0, [int]($minX + ($maxX - $minX)/2 - $squareSize/2))
$cropY = [Math]::Max(0, [int]($minY + ($maxY - $minY)/2 - $squareSize/2))
if ($cropX + $squareSize -gt $srcBmp.Width) { $cropX = $srcBmp.Width - $squareSize }
if ($cropY + $squareSize -gt $srcBmp.Height) { $cropY = $srcBmp.Height - $squareSize }

Write-Host "Crop square: $cropX, $cropY, $squareSize x $squareSize"

# Create cropped square bitmap
$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $squareSize, $squareSize)
$croppedBmp = $srcBmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Function to resize bitmap with HighQualityBicubic
function Resize-Bitmap($bmp, $targetWidth, $targetHeight) {
    $dest = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($bmp, 0, 0, $targetWidth, $targetHeight)
    $g.Dispose()
    return $dest
}

# Function to make black background transparent
function ConvertTo-Transparent($bmp) {
    $outBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $c = $bmp.GetPixel($x, $y)
            # Max component indicates luminosity on black
            $maxVal = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
            if ($maxVal -le 10) {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($maxVal -lt 60) {
                # Smooth alpha transition in the glow edge
                $alpha = [int](($maxVal - 10) / 50.0 * 255.0)
                $r = [Math]::Min(255, [int]($c.R * 255.0 / $maxVal))
                $g = [Math]::Min(255, [int]($c.G * 255.0 / $maxVal))
                $b = [Math]::Min(255, [int]($c.B * 255.0 / $maxVal))
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
            } else {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }
    return $outBmp
}

# Generate 512x512 master transparent mark
$mark512 = Resize-Bitmap $croppedBmp 512 512
$transparentMark512 = ConvertTo-Transparent $mark512

# Save newbhar-mark.png (transparent for versatile web embedding)
$transparentMark512.Save("public/newbhar-mark.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Generated public/newbhar-mark.png (512x512)"

# Favicon sizes
$sizes = @(16, 32, 48, 96, 180, 192, 512)
foreach ($s in $sizes) {
    $resized = Resize-Bitmap $croppedBmp $s $s
    if ($s -eq 180) {
        $resized.Save("public/apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Generated public/apple-touch-icon.png"
    } elseif ($s -eq 192) {
        $resized.Save("public/icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Generated public/icon-192.png"
    } elseif ($s -eq 512) {
        $resized.Save("public/icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Generated public/icon-512.png"
    } else {
        $resized.Save("public/favicon-$($s)x$($s).png", [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Generated public/favicon-$($s)x$($s).png"
    }
    $resized.Dispose()
}

# Generate favicon.ico from 32x32 image
$fav32 = Resize-Bitmap $croppedBmp 32 32
$iconHandle = $fav32.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($iconHandle)
$stream = [System.IO.File]::Create("public/favicon.ico")
$ico.Save($stream)
$stream.Close()
$ico.Dispose()
$fav32.Dispose()
Write-Host "Generated public/favicon.ico"

# Clean up
$transparentMark512.Dispose()
$mark512.Dispose()
$croppedBmp.Dispose()
$srcBmp.Dispose()
Write-Host "Done generating core marks and favicons!"
