using System;
using System.Reflection;
using Xunit;

namespace Keystra.Tests
{
    public class EscapeJsonStringTests
    {
        private static string EscapeJsonString(string input)
        {
            var type = typeof(Keystra.KeystraHook);
            if (type == null) throw new Exception("Type Keystra.KeystraHook not found");
            var methodInfo = type.GetMethod("EscapeJsonString", BindingFlags.NonPublic | BindingFlags.Static);
            if (methodInfo == null) throw new Exception("Method EscapeJsonString not found");

            return (string)methodInfo.Invoke(null, new object[] { input });
        }

        [Fact]
        public void EscapeJsonString_ReturnsEmpty_ForNullOrEmpty()
        {
            Assert.Equal("", EscapeJsonString(null));
            Assert.Equal("", EscapeJsonString(""));
        }

        [Fact]
        public void EscapeJsonString_ReturnsUnchanged_ForNormalString()
        {
            Assert.Equal("hello world", EscapeJsonString("hello world"));
            Assert.Equal("12345", EscapeJsonString("12345"));
            Assert.Equal("A simple test", EscapeJsonString("A simple test"));
        }

        [Fact]
        public void EscapeJsonString_EscapesSpecialCharacters()
        {
            Assert.Equal("\\\\", EscapeJsonString("\\"));
            Assert.Equal("\\\"", EscapeJsonString("\""));
            Assert.Equal("\\t", EscapeJsonString("\t"));
            Assert.Equal("\\n", EscapeJsonString("\n"));
            Assert.Equal("\\r", EscapeJsonString("\r"));
            Assert.Equal("hello\\nworld", EscapeJsonString("hello\nworld"));
            Assert.Equal("\\\"quoted\\\"", EscapeJsonString("\"quoted\""));
            Assert.Equal("path\\\\to\\\\file", EscapeJsonString("path\\to\\file"));
        }

        [Fact]
        public void EscapeJsonString_SkipsControlCharacters()
        {
            Assert.Equal("hello", EscapeJsonString("he\u0000llo"));
            Assert.Equal("test", EscapeJsonString("t\u001Best"));
            Assert.Equal("abc", EscapeJsonString("\u0001a\u0002b\u0003c\u001F"));
        }

        [Fact]
        public void EscapeJsonString_HandlesMixedInputs()
        {
            string input = "Line1\nLine2\tPath: C:\\test\\\"file\".txt\u0007";
            string expected = "Line1\\nLine2\\tPath: C:\\\\test\\\\\\\"file\\\".txt";
            Assert.Equal(expected, EscapeJsonString(input));
        }
    }
}
