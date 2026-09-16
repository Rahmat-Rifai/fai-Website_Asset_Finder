import net from "node:net";

function ipv4ToNumber(address: string): number {
  return (
    address
      .split(".")
      .reduce((value, octet) => value * 256 + Number(octet), 0) >>> 0
  );
}

function inIpv4Range(address: string, base: string, mask: number): boolean {
  const value = ipv4ToNumber(address);
  const network = ipv4ToNumber(base);
  const maskValue = mask === 0 ? 0 : (0xffffffff << (32 - mask)) >>> 0;
  return (value & maskValue) === (network & maskValue);
}

/** Return true for loopback, private, link-local, multicast, and reserved IPs. */
export function isPrivateIp(address: string): boolean {
  const family = net.isIP(address);
  if (family === 4) {
    const ranges: Array<[string, number]> = [
      ["0.0.0.0", 8],
      ["10.0.0.0", 8],
      ["100.64.0.0", 10],
      ["127.0.0.0", 8],
      ["169.254.0.0", 16],
      ["172.16.0.0", 12],
      ["192.0.0.0", 24],
      ["192.0.2.0", 24],
      ["192.168.0.0", 16],
      ["198.18.0.0", 15],
      ["198.51.100.0", 24],
      ["203.0.113.0", 24],
      ["224.0.0.0", 4],
      ["240.0.0.0", 4],
    ];
    return ranges.some(([base, mask]) => inIpv4Range(address, base, mask));
  }

  if (family === 6) {
    const normalised = address.toLowerCase();
    // IPv4-mapped IPv6, e.g. ::ffff:127.0.0.1
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalised);
    if (mapped) return isPrivateIp(mapped[1]);
    return (
      normalised === "::" ||
      normalised === "::1" ||
      normalised.startsWith("fc") ||
      normalised.startsWith("fd") ||
      normalised.startsWith("fe8") ||
      normalised.startsWith("fe9") ||
      normalised.startsWith("fea") ||
      normalised.startsWith("feb") ||
      normalised.startsWith("ff")
    );
  }

  return true;
}
