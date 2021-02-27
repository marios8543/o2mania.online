from struct import unpack
from collections import namedtuple
from json import JSONEncoder
from base64 import b64encode
from sys import argv

def set_bit(value, bit):
    return value | (1<<bit)

def clear_bit(value, bit):
    return value & ~(1<<bit)

f = open(input(), "rb")

ojn_header = namedtuple("ojn_header", """
songid signature encode_version genre bpm level1 level2 level3 level_cover event_count1
event_count2 event_count3 note_count1 note_count2 note_count3 measure_count1 measure_count2
measure_count3 package_count1 package_count2 package_count3 old_encode_version old_songid
old_genre bmp_size old_file_version title artist noter ojm_file cover_size time1 time2 time3
note_offset1 note_offset2 note_offset3 file_version
""".replace("\n", " "))
ojn_header_format_string = """
i 4s f i f hhhh iii iii iii iii h h 20s i i 64s 32s 32s 32s i iii iii i
"""

package_header = namedtuple("package_header", "measure channel events")
package_header_format_string = "i h h"

note_event = namedtuple("note_event", "value volume_pan note_type")
note_event_format_string = "h c b"

def parse_note_event():
    value, volume_pan, note_type = unpack(note_event_format_string, f.read(4))
    volume = 0
    pan = 0
    volume_pan = int.from_bytes(volume_pan, "little")
    if not value == 0:
        value -= 1
    for i in range(4):
        if (volume_pan >> i) & 1:
            volume = set_bit(volume, i)
        if (volume_pan >> 4+i) & 1:
            pan = set_bit(pan, i)
    return {"value" : value, "volume": volume, "pan": pan, "note_type": note_type}

def parse_package():
    measure, channel, events = unpack(package_header_format_string, f.read(8))
    event_list = []
    for _ in range(events):
        if channel == 1:
            event_list.append(unpack("f", f.read(4))[0])
        else:
            event_list.append(parse_note_event())
    return {"measure": measure, "channel": channel, "events": event_list}

chart_header = ojn_header._make(unpack(ojn_header_format_string, f.read(300)))._asdict()

f.seek(chart_header["note_offset1"])
dif_easy = [parse_package() for i in range(chart_header["package_count1"])]

f.seek(chart_header["note_offset2"])
dif_normal = [parse_package() for i in range(chart_header["package_count2"])]

f.seek(chart_header["note_offset3"])
dif_hard = [parse_package() for i in range(chart_header["package_count3"])]

chart_dict = dict(chart_header)
chart_dict["notes"] = []
chart_dict["notes"].append(dif_easy)
chart_dict["notes"].append(dif_normal)
chart_dict["notes"].append(dif_hard)

class CJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, bytes):
            return str(obj)
        return JSONEncoder.default(self, obj)

for i in ['title', 'artist', 'ojm_file', 'noter']:
    chart_dict[i] = chart_dict[i].decode("windows-1252")
    chart_dict[i] = chart_dict[i].replace("\\u0000", "")

f2 = open("chart.json", "w+")
f2.write(CJSONEncoder().encode(chart_dict))
f2.close()