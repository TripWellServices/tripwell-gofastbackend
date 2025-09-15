#!/usr/bin/env python3
"""
Angela Paris Test Results Analyzer
Analyzes the output from comprehensive Angela tests to understand prompt weights and behavior
"""

import json
import re
from collections import Counter, defaultdict
from datetime import datetime
import os

def load_test_results(filename):
    """Load test results from JSON file"""
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ File {filename} not found. Run the test suite first.")
        return None

def analyze_anchor_patterns(results):
    """Analyze patterns in anchor suggestions"""
    print("🔍 ANALYZING ANCHOR PATTERNS")
    print("=" * 50)
    
    all_anchors = []
    budget_anchors = defaultdict(list)
    vibe_anchors = defaultdict(list)
    priority_anchors = defaultdict(list)
    
    for result in results:
        if not result.get('success') or not result.get('outputAnchors'):
            continue
            
        profile = result['profileName']
        anchors = result['outputAnchors']
        input_data = result['inputData']
        
        # Extract key factors
        budget = input_data['tripIntentData'].get('budget', 'unknown')
        vibes = input_data['tripIntentData'].get('vibes', [])
        priorities = input_data['tripIntentData'].get('priorities', [])
        
        for anchor in anchors:
            all_anchors.append(anchor)
            
            # Group by budget range
            if '$30-50' in budget:
                budget_anchors['budget'].append(anchor)
            elif '$800-1200' in budget:
                budget_anchors['luxury'].append(anchor)
            elif '$200-350' in budget:
                budget_anchors['mid-range'].append(anchor)
            else:
                budget_anchors['other'].append(anchor)
            
            # Group by vibes
            for vibe in vibes:
                vibe_anchors[vibe].append(anchor)
            
            # Group by priorities
            for priority in priorities:
                priority_anchors[priority].append(anchor)
    
    print(f"📊 Total Anchors Analyzed: {len(all_anchors)}")
    print(f"📊 Successful Tests: {len([r for r in results if r.get('success')])}")
    
    return {
        'all_anchors': all_anchors,
        'budget_anchors': budget_anchors,
        'vibe_anchors': vibe_anchors,
        'priority_anchors': priority_anchors
    }

def analyze_budget_impact(analysis_data):
    """Analyze how budget affects anchor suggestions"""
    print("\n💰 BUDGET IMPACT ANALYSIS")
    print("=" * 50)
    
    budget_anchors = analysis_data['budget_anchors']
    
    for budget_level, anchors in budget_anchors.items():
        if not anchors:
            continue
            
        print(f"\n{budget_level.upper()} BUDGET ({len(anchors)} anchors):")
        
        # Analyze common themes
        titles = [anchor.get('title', '') for anchor in anchors]
        descriptions = [anchor.get('description', '') for anchor in anchors]
        
        # Look for budget indicators in descriptions
        budget_keywords = {
            'free': 0, 'cheap': 0, 'affordable': 0, 'budget': 0,
            'luxury': 0, 'upscale': 0, 'premium': 0, 'expensive': 0,
            'guided': 0, 'private': 0, 'exclusive': 0
        }
        
        for desc in descriptions:
            desc_lower = desc.lower()
            for keyword in budget_keywords:
                if keyword in desc_lower:
                    budget_keywords[keyword] += 1
        
        print("  Budget Keywords Found:")
        for keyword, count in budget_keywords.items():
            if count > 0:
                print(f"    {keyword}: {count}")
        
        # Show sample titles
        print("  Sample Titles:")
        for i, title in enumerate(titles[:3]):
            print(f"    {i+1}. {title}")

def analyze_vibe_impact(analysis_data):
    """Analyze how vibes affect anchor suggestions"""
    print("\n🎭 VIBE IMPACT ANALYSIS")
    print("=" * 50)
    
    vibe_anchors = analysis_data['vibe_anchors']
    
    for vibe, anchors in vibe_anchors.items():
        if not anchors:
            continue
            
        print(f"\n{vibe.upper()} VIBE ({len(anchors)} anchors):")
        
        # Analyze common themes
        titles = [anchor.get('title', '') for anchor in anchors]
        descriptions = [anchor.get('description', '') for anchor in anchors]
        
        # Look for vibe indicators
        vibe_keywords = {
            'romantic': 0, 'intimate': 0, 'chill': 0, 'relaxed': 0,
            'adventure': 0, 'active': 0, 'fun': 0, 'social': 0,
            'luxurious': 0, 'upscale': 0, 'authentic': 0, 'local': 0
        }
        
        for desc in descriptions:
            desc_lower = desc.lower()
            for keyword in vibe_keywords:
                if keyword in desc_lower:
                    vibe_keywords[keyword] += 1
        
        print("  Vibe Keywords Found:")
        for keyword, count in vibe_keywords.items():
            if count > 0:
                print(f"    {keyword}: {count}")
        
        # Show sample titles
        print("  Sample Titles:")
        for i, title in enumerate(titles[:3]):
            print(f"    {i+1}. {title}")

def analyze_priority_impact(analysis_data):
    """Analyze how priorities affect anchor suggestions"""
    print("\n🎯 PRIORITY IMPACT ANALYSIS")
    print("=" * 50)
    
    priority_anchors = analysis_data['priority_anchors']
    
    for priority, anchors in priority_anchors.items():
        if not anchors:
            continue
            
        print(f"\n{priority.upper()} PRIORITY ({len(anchors)} anchors):")
        
        # Analyze common themes
        titles = [anchor.get('title', '') for anchor in anchors]
        descriptions = [anchor.get('description', '') for anchor in anchors]
        
        # Look for priority-specific keywords
        priority_keywords = {
            'culture': 0, 'history': 0, 'museum': 0, 'art': 0,
            'food': 0, 'dining': 0, 'restaurant': 0, 'culinary': 0,
            'adventure': 0, 'outdoor': 0, 'hiking': 0, 'active': 0,
            'relaxation': 0, 'wellness': 0, 'spa': 0, 'chill': 0,
            'shopping': 0, 'market': 0, 'boutique': 0, 'fashion': 0,
            'nightlife': 0, 'bar': 0, 'club': 0, 'entertainment': 0
        }
        
        for desc in descriptions:
            desc_lower = desc.lower()
            for keyword in priority_keywords:
                if keyword in desc_lower:
                    priority_keywords[keyword] += 1
        
        print("  Priority Keywords Found:")
        for keyword, count in priority_keywords.items():
            if count > 0:
                print(f"    {keyword}: {count}")
        
        # Show sample titles
        print("  Sample Titles:")
        for i, title in enumerate(titles[:3]):
            print(f"    {i+1}. {title}")

def analyze_mobility_impact(results):
    """Analyze how mobility preferences affect suggestions"""
    print("\n🚶 MOBILITY IMPACT ANALYSIS")
    print("=" * 50)
    
    mobility_groups = defaultdict(list)
    
    for result in results:
        if not result.get('success') or not result.get('outputAnchors'):
            continue
            
        mobility = result['inputData']['tripIntentData'].get('mobility', [])
        anchors = result['outputAnchors']
        
        for mob in mobility:
            mobility_groups[mob].extend(anchors)
    
    for mobility, anchors in mobility_groups.items():
        if not anchors:
            continue
            
        print(f"\n{mobility.upper()} MOBILITY ({len(anchors)} anchors):")
        
        # Look for transportation keywords
        transport_keywords = {
            'walking': 0, 'walk': 0, 'stroll': 0, 'pedestrian': 0,
            'metro': 0, 'subway': 0, 'train': 0, 'transport': 0,
            'taxi': 0, 'uber': 0, 'car': 0, 'drive': 0,
            'bike': 0, 'cycling': 0, 'accessible': 0
        }
        
        for anchor in anchors:
            desc = anchor.get('description', '').lower()
            for keyword in transport_keywords:
                if keyword in desc:
                    transport_keywords[keyword] += 1
        
        print("  Transportation Keywords Found:")
        for keyword, count in transport_keywords.items():
            if count > 0:
                print(f"    {keyword}: {count}")

def generate_recommendations(analysis_data, results):
    """Generate recommendations based on analysis"""
    print("\n💡 RECOMMENDATIONS")
    print("=" * 50)
    
    successful_tests = [r for r in results if r.get('success')]
    failed_tests = [r for r in results if not r.get('success')]
    
    print(f"✅ Success Rate: {len(successful_tests)}/{len(results)} ({len(successful_tests)/len(results)*100:.1f}%)")
    
    if failed_tests:
        print(f"❌ Failed Tests: {len(failed_tests)}")
        for test in failed_tests:
            print(f"    - {test['profileName']}: {test.get('error', 'Unknown error')}")
    
    # Analyze anchor diversity
    all_titles = [anchor.get('title', '') for anchor in analysis_data['all_anchors']]
    unique_titles = set(all_titles)
    
    print(f"\n📊 Anchor Diversity:")
    print(f"    Total Anchors: {len(all_titles)}")
    print(f"    Unique Anchors: {len(unique_titles)}")
    print(f"    Diversity Rate: {len(unique_titles)/len(all_titles)*100:.1f}%")
    
    # Check for common patterns
    print(f"\n🔍 Common Patterns:")
    
    # Most common words in titles
    all_words = []
    for title in all_titles:
        words = re.findall(r'\b\w+\b', title.lower())
        all_words.extend(words)
    
    word_counts = Counter(all_words)
    common_words = word_counts.most_common(10)
    
    print("    Most Common Words in Titles:")
    for word, count in common_words:
        if len(word) > 3:  # Skip short words
            print(f"        {word}: {count}")

def main():
    """Main analysis function"""
    print("🤖 ANGELA PARIS TEST RESULTS ANALYZER")
    print("=" * 60)
    print(f"📅 Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Find the most recent test results file
    json_files = [f for f in os.listdir('.') if f.startswith('angela-paris-test-results-') and f.endswith('.json')]
    
    if not json_files:
        print("❌ No test results files found. Run the test suite first.")
        return
    
    # Use the most recent file
    latest_file = sorted(json_files)[-1]
    print(f"📁 Analyzing: {latest_file}")
    
    # Load and analyze results
    results = load_test_results(latest_file)
    if not results:
        return
    
    # Run analysis
    analysis_data = analyze_anchor_patterns(results)
    analyze_budget_impact(analysis_data)
    analyze_vibe_impact(analysis_data)
    analyze_priority_impact(analysis_data)
    analyze_mobility_impact(results)
    generate_recommendations(analysis_data, results)
    
    print(f"\n🎯 Analysis Complete!")
    print(f"📊 Total Tests: {len(results)}")
    print(f"✅ Successful: {len([r for r in results if r.get('success')])}")
    print(f"❌ Failed: {len([r for r in results if not r.get('success')])}")

if __name__ == "__main__":
    main()
