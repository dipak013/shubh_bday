# Keeps the original files in img/ untouched. The crop rectangles remove UI
# elements baked into several screenshot images while preserving Shubh's face.
Add-Type -AssemblyName System.Drawing

$sourceDirectory = Join-Path $PSScriptRoot '..\img'
$outputDirectory = Join-Path $PSScriptRoot '..\dist\assets\photos'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$crops = @(
  @{ Name = 'img1.jpg'; X = 0; Y = 0; Width = 1068; Height = 741 },
  @{ Name = 'img2.jpg'; X = 0; Y = 350; Width = 1078; Height = 890 },
  @{ Name = 'img3.jpg'; X = 0; Y = 0; Width = 900; Height = 1220 },
  @{ Name = 'img4.jpg'; X = 0; Y = 0; Width = 920; Height = 1115 },
  @{ Name = 'img5.jpg'; X = 0; Y = 0; Width = 973; Height = 1200 },
  @{ Name = 'img6.jpg'; X = 0; Y = 110; Width = 1070; Height = 1106 }
)

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' } |
  Select-Object -First 1
$encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  [long]84
)

foreach ($crop in $crops) {
  $sourcePath = Join-Path $sourceDirectory $crop.Name
  $outputPath = Join-Path $outputDirectory $crop.Name
  $source = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    if ($crop.X + $crop.Width -gt $source.Width -or $crop.Y + $crop.Height -gt $source.Height) {
      throw "Crop exceeds image bounds: $($crop.Name)"
    }
    $bitmap = New-Object System.Drawing.Bitmap($crop.Width, $crop.Height)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $sourceRectangle = New-Object System.Drawing.Rectangle($crop.X, $crop.Y, $crop.Width, $crop.Height)
        $targetRectangle = New-Object System.Drawing.Rectangle(0, 0, $crop.Width, $crop.Height)
        $graphics.DrawImage($source, $targetRectangle, $sourceRectangle, [System.Drawing.GraphicsUnit]::Pixel)
      } finally {
        $graphics.Dispose()
      }
      $bitmap.Save($outputPath, $jpegEncoder, $encoderParameters)
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

$encoderParameters.Dispose()
Get-ChildItem -LiteralPath $outputDirectory -File | Select-Object Name,Length
