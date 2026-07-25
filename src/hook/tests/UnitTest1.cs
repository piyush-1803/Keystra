using Xunit;
using System.Reflection;
using Keystra;
using System.Collections.Generic;

namespace tests;

public class UnitTest1
{
    private string GetKeyName(int vkCode)
    {
        var method = typeof(KeystraHook).GetMethod("GetKeyName", BindingFlags.NonPublic | BindingFlags.Static);
        return (string)method.Invoke(null, new object[] { vkCode })!;
    }

    [Theory]
    [InlineData(65, "A")]
    [InlineData(66, "B")]
    [InlineData(90, "Z")]
    public void GetKeyName_ReturnsCorrectLetter(int vkCode, string expectedName)
    {
        Assert.Equal(expectedName, GetKeyName(vkCode));
    }

    [Theory]
    [InlineData(48, "0")]
    [InlineData(53, "5")]
    [InlineData(57, "9")]
    public void GetKeyName_ReturnsCorrectDigit(int vkCode, string expectedName)
    {
        Assert.Equal(expectedName, GetKeyName(vkCode));
    }

    [Theory]
    [InlineData(8, "Backspace")]
    [InlineData(9, "Tab")]
    [InlineData(13, "Enter")]
    [InlineData(16, "Shift")]
    [InlineData(160, "Shift")]
    [InlineData(161, "Shift")]
    [InlineData(17, "Ctrl")]
    [InlineData(162, "Ctrl")]
    [InlineData(163, "Ctrl")]
    [InlineData(18, "Alt")]
    [InlineData(164, "Alt")]
    [InlineData(165, "Alt")]
    [InlineData(20, "CapsLock")]
    [InlineData(27, "Escape")]
    [InlineData(32, "Space")]
    [InlineData(33, "PageUp")]
    [InlineData(34, "PageDown")]
    [InlineData(35, "End")]
    [InlineData(36, "Home")]
    [InlineData(37, "Left")]
    [InlineData(38, "Up")]
    [InlineData(39, "Right")]
    [InlineData(40, "Down")]
    [InlineData(46, "Delete")]
    [InlineData(91, "Cmd")]
    [InlineData(92, "Cmd")]
    public void GetKeyName_ReturnsCorrectControlKey(int vkCode, string expectedName)
    {
        Assert.Equal(expectedName, GetKeyName(vkCode));
    }

    [Theory]
    [InlineData(186, ";")]
    [InlineData(187, "=")]
    [InlineData(188, ",")]
    [InlineData(189, "-")]
    [InlineData(190, ".")]
    [InlineData(191, "/")]
    [InlineData(192, "`")]
    [InlineData(219, "[")]
    [InlineData(220, "\\")]
    [InlineData(221, "]")]
    [InlineData(222, "'")]
    public void GetKeyName_ReturnsCorrectPunctuation(int vkCode, string expectedName)
    {
        Assert.Equal(expectedName, GetKeyName(vkCode));
    }

    [Theory]
    [InlineData(0, "Code_0")]
    [InlineData(7, "Code_7")]
    [InlineData(47, "Code_47")]
    [InlineData(999, "Code_999")]
    public void GetKeyName_ReturnsFallbackForUnknownCodes(int vkCode, string expectedName)
    {
        Assert.Equal(expectedName, GetKeyName(vkCode));
    }
}
