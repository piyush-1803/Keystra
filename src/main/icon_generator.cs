using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

namespace Keystra
{
    class IconGenerator
    {
        static void Main()
        {
            int size = 256;
            string outputPath = "icon.png";

            using (Bitmap bmp = new Bitmap(size, size))
            using (Graphics g = Graphics.FromImage(bmp))
            {
                // Enable anti-aliasing for smooth gradients and text
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

                // 1. Draw a deep surface background (#131314)
                using (SolidBrush bgBrush = new SolidBrush(Color.FromArgb(255, 19, 19, 20)))
                {
                    g.FillRectangle(bgBrush, 0, 0, size, size);
                }

                // 2. Draw a central soft indigo radial aura glow (#5856d6)
                using (GraphicsPath glowPath = new GraphicsPath())
                {
                    glowPath.AddEllipse(32, 32, 192, 192);
                    using (PathGradientBrush pgb = new PathGradientBrush(glowPath))
                    {
                        pgb.CenterColor = Color.FromArgb(80, 88, 86, 214); // Semi-transparent indigo
                        pgb.SurroundColors = new Color[] { Color.FromArgb(0, 0, 0, 0) };
                        g.FillEllipse(pgb, 16, 16, 224, 224);
                    }
                }

                // 3. Draw a rounded glassmorphic keycap plate
                int keycapSize = 160;
                int x = (size - keycapSize) / 2;
                int y = (size - keycapSize) / 2;
                Rectangle keycapRect = new Rectangle(x, y, keycapSize, keycapSize);
                int radius = 32;

                // Fill with dark glass gradient
                using (LinearGradientBrush glassBrush = new LinearGradientBrush(
                    keycapRect, 
                    Color.FromArgb(255, 44, 44, 46), 
                    Color.FromArgb(255, 28, 28, 30), 
                    45f))
                {
                    FillRoundedRectangle(g, glassBrush, keycapRect, radius);
                }

                // Draw subtle glowing hairline border
                using (LinearGradientBrush borderBrush = new LinearGradientBrush(
                    keycapRect, 
                    Color.FromArgb(150, 194, 193, 255), // Indigo glow
                    Color.FromArgb(40, 78, 222, 163),   // Faint emerald glow
                    45f))
                using (Pen borderPen = new Pen(borderBrush, 1.5f))
                {
                    DrawRoundedRectangle(g, borderPen, keycapRect, radius);
                }

                // 4. Draw a stylized keyboard symbol inside the keycap
                // We draw the letter 'K' with a premium Electric Indigo to Emerald linear gradient
                string letter = "K";
                using (Font font = new Font("Segoe UI", 68, FontStyle.Bold))
                {
                    SizeF letterSize = g.MeasureString(letter, font);
                    float lx = x + (keycapSize - letterSize.Width) / 2 + 4; // slight horizontal offset offset for Segoe alignment
                    float ly = y + (keycapSize - letterSize.Height) / 2;

                    RectangleF textRect = new RectangleF(lx, ly, letterSize.Width, letterSize.Height);

                    using (LinearGradientBrush textBrush = new LinearGradientBrush(
                        textRect,
                        Color.FromArgb(255, 194, 193, 255), // Electric Indigo
                        Color.FromArgb(255, 78, 222, 163),  // Emerald Green
                        45f))
                    {
                        g.DrawString(letter, font, textBrush, textRect);
                    }
                }

                // Save out the high resolution 256x256 icon
                bmp.Save(outputPath, ImageFormat.Png);
                Console.WriteLine("Successfully created 256x256 PNG app icon at: " + outputPath);
            }
        }

        private static void DrawRoundedRectangle(Graphics g, Pen pen, Rectangle rect, int radius)
        {
            using (GraphicsPath path = GetRoundedRectPath(rect, radius))
            {
                g.DrawPath(pen, path);
            }
        }

        private static void FillRoundedRectangle(Graphics g, Brush brush, Rectangle rect, int radius)
        {
            using (GraphicsPath path = GetRoundedRectPath(rect, radius))
            {
                g.FillPath(brush, path);
            }
        }

        private static GraphicsPath GetRoundedRectPath(Rectangle rect, int radius)
        {
            GraphicsPath path = new GraphicsPath();
            int diameter = radius * 2;
            path.AddArc(rect.X, rect.Y, diameter, diameter, 180, 90);
            path.AddArc(rect.X + rect.Width - diameter, rect.Y, diameter, diameter, 270, 90);
            path.AddArc(rect.X + rect.Width - diameter, rect.Y + rect.Height - diameter, diameter, diameter, 0, 90);
            path.AddArc(rect.X, rect.Y + rect.Height - diameter, diameter, diameter, 90, 90);
            path.CloseAllFigures();
            return path;
        }
    }
}
