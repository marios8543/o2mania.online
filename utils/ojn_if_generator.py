from utils.ojn_parser import OJNParser

chart = OJNParser(input())
dc = chart.parse()

def process_chart(chart):
    for measure in chart:
        pass