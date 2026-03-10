param(
    [Parameter(Mandatory=$true)]
    [string]$Name,

    [int]$Delay = 0,

    [switch]$NoTitleBar
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type @'
using System;
using System.Runtime.InteropServices;

public class Win32Capture {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern bool ClientToScreen(IntPtr hWnd, ref POINT lpPoint);

    [DllImport("user32.dll")]
    public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdcBlt, uint nFlags);

    [DllImport("dwmapi.dll")]
    public static extern int DwmGetWindowAttribute(IntPtr hwnd, int dwAttribute, out RECT pvAttribute, int cbAttribute);

    public const int SW_RESTORE = 9;
    public const int DWMWA_EXTENDED_FRAME_BOUNDS = 9;

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left, Top, Right, Bottom;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT {
        public int X, Y;
    }
}
'@

$gameTitle = [char]0xCE74 + [char]0xC624 + [char]0xC2A4 + ' ' + [char]0xC81C + [char]0xB85C + ' ' + [char]0xB098 + [char]0xC774 + [char]0xD2B8 + [char]0xBA54 + [char]0xC5B4
$outputDir = Join-Path $PSScriptRoot ('..{0}docs{0}analysis{0}images' -f [IO.Path]::DirectorySeparatorChar)
$outputPath = Join-Path $outputDir ('{0}.png' -f $Name)

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$proc = Get-Process | Where-Object { $_.MainWindowTitle -eq $gameTitle } | Select-Object -First 1

if (-not $proc) {
    Write-Host ('ERROR: {0} not found.' -f $gameTitle) -ForegroundColor Red
    Write-Host 'Running windows:' -ForegroundColor Yellow
    Get-Process | Where-Object { $_.MainWindowTitle -ne '' } | ForEach-Object {
        Write-Host ('  - {0} ({1})' -f $_.MainWindowTitle, $_.ProcessName) -ForegroundColor Gray
    }
    exit 1
}

$hwnd = $proc.MainWindowHandle
Write-Host ('FOUND: {0} (PID: {1})' -f $gameTitle, $proc.Id) -ForegroundColor Green

if ($Delay -gt 0) {
    for ($i = $Delay; $i -gt 0; $i--) {
        Write-Host ('  Capture in {0}s...' -f $i) -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
}

[Win32Capture]::ShowWindow($hwnd, [Win32Capture]::SW_RESTORE) | Out-Null
[Win32Capture]::SetForegroundWindow($hwnd) | Out-Null
Start-Sleep -Milliseconds 500

$rect = New-Object Win32Capture+RECT

if ($NoTitleBar) {
    # Get client area (excludes title bar and borders)
    $clientRect = New-Object Win32Capture+RECT
    [Win32Capture]::GetClientRect($hwnd, [ref]$clientRect) | Out-Null
    $origin = New-Object Win32Capture+POINT
    $origin.X = 0; $origin.Y = 0
    [Win32Capture]::ClientToScreen($hwnd, [ref]$origin) | Out-Null
    $rect.Left = $origin.X
    $rect.Top = $origin.Y
    $rect.Right = $origin.X + $clientRect.Right
    $rect.Bottom = $origin.Y + $clientRect.Bottom
    Write-Host 'Mode: Client area only (no title bar)' -ForegroundColor Cyan
} else {
    $dwmResult = [Win32Capture]::DwmGetWindowAttribute(
        $hwnd,
        [Win32Capture]::DWMWA_EXTENDED_FRAME_BOUNDS,
        [ref]$rect,
        [System.Runtime.InteropServices.Marshal]::SizeOf($rect)
    )
    if ($dwmResult -ne 0) {
        [Win32Capture]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
    }
}

$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top

Write-Host ('Capture size: {0} x {1}' -f $width, $height) -ForegroundColor Green

# Method 1: CopyFromScreen
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, (New-Object System.Drawing.Size($width, $height)))
$graphics.Dispose()

# Check for black screen (anti-cheat block)
$p1 = $bitmap.GetPixel([int]($width/4), [int]($height/4))
$p2 = $bitmap.GetPixel([int]($width/2), [int]($height/2))
$p3 = $bitmap.GetPixel([int]($width*3/4), [int]($height*3/4))
$allBlack = ($p1.R + $p1.G + $p1.B + $p2.R + $p2.G + $p2.B + $p3.R + $p3.G + $p3.B) -eq 0

if ($allBlack) {
    Write-Host 'WARN: CopyFromScreen returned black - trying PrintWindow...' -ForegroundColor Yellow
    $bitmap.Dispose()

    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $hdc = $graphics.GetHdc()
    [Win32Capture]::PrintWindow($hwnd, $hdc, 2) | Out-Null
    $graphics.ReleaseHdc($hdc)
    $graphics.Dispose()

    $p1 = $bitmap.GetPixel([int]($width/4), [int]($height/4))
    $p2 = $bitmap.GetPixel([int]($width/2), [int]($height/2))
    $stillBlack = ($p1.R + $p1.G + $p1.B + $p2.R + $p2.G + $p2.B) -eq 0

    if ($stillBlack) {
        Write-Host 'WARN: PrintWindow also black - trying flag 0...' -ForegroundColor Yellow
        $bitmap.Dispose()
        $bitmap = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $hdc = $graphics.GetHdc()
        [Win32Capture]::PrintWindow($hwnd, $hdc, 0) | Out-Null
        $graphics.ReleaseHdc($hdc)
        $graphics.Dispose()
    }
}

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

$fileInfo = Get-Item $outputPath
$sizeKB = [math]::Round($fileInfo.Length / 1KB, 1)

Write-Host ''
Write-Host '====================================' -ForegroundColor Cyan
Write-Host ('  CAPTURED: {0}.png ({1} KB)' -f $Name, $sizeKB) -ForegroundColor Green
Write-Host ('  Path: {0}' -f $outputPath) -ForegroundColor Gray
Write-Host '====================================' -ForegroundColor Cyan
Write-Host ''

$needed = @('party-setup', 'combat-stress', 'collapse', 'ego-skill', 'epiphany-select', 'epiphany-character')
Write-Host 'Screenshot progress:' -ForegroundColor Yellow
foreach ($n in $needed) {
    $path = Join-Path $outputDir ('{0}.png' -f $n)
    if (Test-Path $path) {
        $sz = [math]::Round((Get-Item $path).Length / 1KB, 1)
        Write-Host ('  [v] {0}.png ({1} KB)' -f $n, $sz) -ForegroundColor Green
    } else {
        Write-Host ('  [ ] {0}.png' -f $n) -ForegroundColor DarkGray
    }
}
