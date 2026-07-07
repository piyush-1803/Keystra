using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Automation;

namespace Keystra
{
    class KeystraHook
    {
        // P/Invoke constants
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int WM_SYSKEYDOWN = 0x0104;
        private const int WM_KEYUP = 0x0101;
        private const int WM_SYSKEYUP = 0x0105;

        // Structure for low-level keyboard hook
        [StructLayout(LayoutKind.Sequential)]
        private struct KBDLLHOOKSTRUCT
        {
            public int vkCode;
            public int scanCode;
            public int flags;
            public int time;
            public IntPtr dwExtraInfo;
        }

        // Delegate for keyboard hook callback
        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

        // Win32 APIs
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll", SetLastError = true)]
        private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

        // Hook variables
        private static LowLevelKeyboardProc _proc = HookCallback;
        private static IntPtr _hookID = IntPtr.Zero;

        // State caching variables (updated by background thread)
        private static string _currentAppTitle = "";
        private static string _currentProcessName = "";
        private static bool _isSensitiveContext = false;
        private static IntPtr _lastHWnd = IntPtr.Zero;

        static void Main(string[] args)
        {
            // Start background thread to track active window context and focused fields
            Thread contextThread = new Thread(TrackContextLoop);
            contextThread.IsBackground = true;
            contextThread.Start();

            // Register global key hook
            _hookID = SetHook(_proc);

            // Keep the console application running with a message loop (Win32 requirement for hooks)
            System.Windows.Forms.Application.Run();

            // Cleanup hook on exit
            UnhookWindowsHookEx(_hookID);
        }

        private static IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        // Callback executed for every keyboard event
        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0)
            {
                int eventType = wParam.ToInt32();
                if (eventType == WM_KEYDOWN || eventType == WM_SYSKEYDOWN ||
                    eventType == WM_KEYUP || eventType == WM_SYSKEYUP)
                {
                    KBDLLHOOKSTRUCT kbStruct = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));
                    bool isDown = (eventType == WM_KEYDOWN || eventType == WM_SYSKEYDOWN);
                    
                    // Format key event to JSON
                    SendKeyEvent(kbStruct.vkCode, isDown);
                }
            }
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }

        private static void SendKeyEvent(int vkCode, bool isDown)
        {
            // Determine key text representation or mask if context is sensitive
            string keyName = "UNKNOWN";
            if (_isSensitiveContext)
            {
                keyName = "[MASKED]";
            }
            else
            {
                keyName = GetKeyName(vkCode);
            }

            // Clean fields to avoid JSON escaping issues
            string safeTitle = EscapeJsonString(_currentAppTitle);
            string safeProcess = EscapeJsonString(_currentProcessName);
            string safeKey = EscapeJsonString(keyName);

            // Construct JSON line
            string json = string.Format(
                "{{\"event\":\"{0}\",\"vkCode\":{1},\"keyName\":\"{2}\",\"window\":\"{3}\",\"process\":\"{4}\",\"timestamp\":{5}}}",
                isDown ? "keydown" : "keyup",
                vkCode,
                safeKey,
                safeTitle,
                safeProcess,
                DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            );

            // Output JSON to standard stdout stream and flush immediately
            Console.WriteLine(json);
            Console.Out.Flush();
        }

        private static string GetKeyName(int vkCode)
        {
            // Return string representation of virtual key codes for analytics
            if (vkCode >= 65 && vkCode <= 90) return ((char)vkCode).ToString(); // A-Z
            if (vkCode >= 48 && vkCode <= 57) return ((char)vkCode).ToString(); // 0-9
            
            switch (vkCode)
            {
                case 8: return "Backspace";
                case 9: return "Tab";
                case 13: return "Enter";
                case 16:
                case 160:
                case 161: return "Shift";
                case 17:
                case 162:
                case 163: return "Ctrl";
                case 18:
                case 164:
                case 165: return "Alt";
                case 20: return "CapsLock";
                case 27: return "Escape";
                case 32: return "Space";
                case 33: return "PageUp";
                case 34: return "PageDown";
                case 35: return "End";
                case 36: return "Home";
                case 37: return "Left";
                case 38: return "Up";
                case 39: return "Right";
                case 40: return "Down";
                case 46: return "Delete";
                case 91:
                case 92: return "Cmd";
                case 186: return ";";
                case 187: return "=";
                case 188: return ",";
                case 189: return "-";
                case 190: return ".";
                case 191: return "/";
                case 192: return "`";
                case 219: return "[";
                case 220: return "\\";
                case 221: return "]";
                case 222: return "'";
                default:
                    return "Code_" + vkCode;
            }
        }

        private static string EscapeJsonString(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < s.Length; i++)
            {
                char c = s[i];
                if (c == '\\') sb.Append("\\\\");
                else if (c == '"') sb.Append("\\\"");
                else if (c == '\t') sb.Append("\\t");
                else if (c == '\n') sb.Append("\\n");
                else if (c == '\r') sb.Append("\\r");
                else if (c < 32) { /* Skip control characters */ }
                else sb.Append(c);
            }
            return sb.ToString();
        }

        // Background thread loop to check foreground window titles and UI Automation fields
        private static void TrackContextLoop()
        {
            while (true)
            {
                try
                {
                    IntPtr hwnd = GetForegroundWindow();
                    if (hwnd != IntPtr.Zero)
                    {
                        // Update window title and process if foreground window changes
                        if (hwnd != _lastHWnd)
                        {
                            _lastHWnd = hwnd;

                            // Title
                            StringBuilder titleBuilder = new StringBuilder(256);
                            GetWindowText(hwnd, titleBuilder, 256);
                            _currentAppTitle = titleBuilder.ToString();

                            // Process Name
                            uint pid = 0;
                            GetWindowThreadProcessId(hwnd, out pid);
                            if (pid != 0)
                            {
                                try
                                {
                                    using (Process p = Process.GetProcessById((int)pid))
                                    {
                                        _currentProcessName = p.ProcessName + ".exe";
                                    }
                                }
                                catch
                                {
                                    _currentProcessName = "Unknown.exe";
                                }
                            }

                            // Class Name
                            StringBuilder classBuilder = new StringBuilder(256);
                            GetClassName(hwnd, classBuilder, 256);
                            string className = classBuilder.ToString().ToLower();

                            // Heuristic checks on Window title or class
                            string titleLower = _currentAppTitle.ToLower();
                            string procLower = _currentProcessName.ToLower();

                            if (titleLower.Contains("password") || 
                                titleLower.Contains("credentials") ||
                                titleLower.Contains("pin entry") ||
                                titleLower.Contains("keychain") ||
                                className.Contains("password") ||
                                procLower.Contains("1password") ||
                                procLower.Contains("bitwarden") ||
                                procLower.Contains("keepass") ||
                                procLower.Contains("authenticator") ||
                                procLower.Contains("credentialuibroker"))
                            {
                                _isSensitiveContext = true;
                            }
                            else
                            {
                                _isSensitiveContext = false;
                            }
                        }

                        // Deep check: Active Input element check using .NET UI Automation
                        // This identifies standard password fields in web browsers, code editors, and native windows
                        if (!_isSensitiveContext)
                        {
                            try
                            {
                                AutomationElement focusedElement = AutomationElement.FocusedElement;
                                if (focusedElement != null)
                                {
                                    object isPassObj = focusedElement.GetCurrentPropertyValue(AutomationElement.IsPasswordProperty, true);
                                    if (isPassObj is bool && (bool)isPassObj)
                                    {
                                        _isSensitiveContext = true;
                                    }
                                }
                            }
                            catch
                            {
                                // FocusedElement can fail if focused app runs elevated or COM call times out.
                                // We default to the previous window-level safety state.
                            }
                        }
                    }
                }
                catch
                {
                    // Catch-all to prevent the context tracker thread from crashing
                }

                // Poll every 400ms. This interval provides high responsiveness while keeping CPU load < 0.1%
                Thread.Sleep(400);
            }
        }
    }
}
