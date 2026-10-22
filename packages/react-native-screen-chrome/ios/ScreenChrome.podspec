require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ScreenChrome'
  s.version        = package['version']
  s.summary        = package['description']
  s.license        = package['license']
  s.author         = 'rnw-community'
  s.homepage       = 'https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { :git => 'https://github.com/rnw-community/rnw-community.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files   = '**/*.swift'
end
